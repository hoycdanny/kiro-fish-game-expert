import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Shared fish pool damage attribution.
 *
 * Three properties matter, and all three are fish-specific — a slot machine has
 * no analogue:
 *
 *  1. Model A (killing blow takes all) makes an individual seat's expected value
 *     depend on who else is at the table. That dependency is legitimate but must
 *     be disclosed, and it is provable.
 *  2. Model B must allocate by INVESTED COST, not by damage dealt. Allocating by
 *     damage breaks the proportionality between stake and payout and therefore
 *     breaks per-bet-multiplier RTP parity.
 *  3. Under any model, the sum of per-seat payouts must equal the amount owed
 *     exactly. Rounding remainders must be allocated deterministically.
 */

interface Contribution {
  seatId: number;
  betMultiplier: number;
  damage: number;
}

/** Model A: the seat landing the killing blow receives the entire payout. */
function allocateModelA(
  contributions: Contribution[],
  killingSeatId: number,
  payout: number
): Map<number, number> {
  const out = new Map<number, number>();
  for (const c of contributions) out.set(c.seatId, 0);
  out.set(killingSeatId, payout);
  return out;
}

/**
 * Model B: allocate in proportion to invested cost, with the remainder given to
 * the killing seat so the total is exact.
 */
function allocateModelB(
  contributions: Contribution[],
  killingSeatId: number,
  payout: number,
  minorUnit = 100
): Map<number, number> {
  const costBySeat = new Map<number, number>();
  for (const c of contributions) {
    // Invested cost is bullets fired times stake per bullet. Damage stands in for
    // bullets here, which is why cost must be weighted by the bet multiplier.
    const cost = c.damage * c.betMultiplier;
    costBySeat.set(c.seatId, (costBySeat.get(c.seatId) ?? 0) + cost);
  }
  const totalCost = [...costBySeat.values()].reduce((a, b) => a + b, 0);

  const payoutUnits = Math.round(payout * minorUnit);
  const out = new Map<number, number>();
  let allocatedUnits = 0;

  const seats = [...costBySeat.keys()];
  for (const seatId of seats) {
    const share = Math.floor((payoutUnits * (costBySeat.get(seatId) ?? 0)) / totalCost);
    out.set(seatId, share);
    allocatedUnits += share;
  }

  // Deterministic remainder rule: the killing seat absorbs it.
  const remainder = payoutUnits - allocatedUnits;
  out.set(killingSeatId, (out.get(killingSeatId) ?? 0) + remainder);

  const result = new Map<number, number>();
  for (const [seatId, units] of out) result.set(seatId, units / minorUnit);
  return result;
}

function sumAllocations(alloc: Map<number, number>): number {
  return [...alloc.values()].reduce((a, b) => a + b, 0);
}

const contributionArb = fc.record({
  seatId: fc.integer({ min: 1, max: 8 }),
  betMultiplier: fc.constantFrom(1, 2, 5, 10, 20, 50, 100),
  damage: fc.double({ min: 0.5, max: 200, noNaN: true, noDefaultInfinity: true }),
});

const contributionsArb = fc
  .array(contributionArb, { minLength: 1, maxLength: 30 })
  .filter((cs) => new Set(cs.map((c) => c.seatId)).size >= 1);

describe('Model A: killing blow takes all', () => {
  it('Property: the killing seat receives the full payout and everyone else receives nothing', () => {
    fc.assert(
      fc.property(
        contributionsArb,
        fc.double({ min: 0.01, max: 100000, noNaN: true, noDefaultInfinity: true }),
        (contributions, payout) => {
          const seats = [...new Set(contributions.map((c) => c.seatId))];
          const killingSeat = seats[0];
          const alloc = allocateModelA(contributions, killingSeat, payout);

          expect(alloc.get(killingSeat)).toBe(payout);
          for (const seatId of seats) {
            if (seatId === killingSeat) continue;
            expect(alloc.get(seatId)).toBe(0);
          }
          expect(sumAllocations(alloc)).toBeCloseTo(payout, 10);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * The disclosure-worthy consequence: a seat that did most of the damage can
   * receive nothing. This is why 搶魚 must be surfaced to players and why seat
   * expected value depends on table composition.
   */
  it('Property: a seat can contribute the majority of damage and still receive zero', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10, max: 1000, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.01, max: 1, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 100000, noNaN: true, noDefaultInfinity: true }),
        (majorityDamage, minorityDamage, payout) => {
          const contributions: Contribution[] = [
            { seatId: 1, betMultiplier: 10, damage: majorityDamage },
            { seatId: 2, betMultiplier: 10, damage: minorityDamage },
          ];
          const alloc = allocateModelA(contributions, 2, payout);
          expect(alloc.get(1)).toBe(0);
          expect(alloc.get(2)).toBe(payout);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Model B: proportional allocation by invested cost', () => {
  it('Property: allocations always sum exactly to the payout owed', () => {
    fc.assert(
      fc.property(
        contributionsArb,
        fc.integer({ min: 1, max: 1000000 }),
        (contributions, payoutCents) => {
          const payout = payoutCents / 100;
          const seats = [...new Set(contributions.map((c) => c.seatId))];
          const alloc = allocateModelB(contributions, seats[0], payout);
          expect(sumAllocations(alloc)).toBeCloseTo(payout, 8);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property: every seat that contributed appears in the allocation', () => {
    fc.assert(
      fc.property(
        contributionsArb,
        fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
        (contributions, payout) => {
          const seats = [...new Set(contributions.map((c) => c.seatId))];
          const alloc = allocateModelB(contributions, seats[0], payout);
          for (const seatId of seats) {
            expect(alloc.has(seatId), `seat ${seatId} missing from allocation`).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: no seat receives a negative allocation', () => {
    fc.assert(
      fc.property(
        contributionsArb,
        fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
        (contributions, payout) => {
          const seats = [...new Set(contributions.map((c) => c.seatId))];
          const alloc = allocateModelB(contributions, seats[0], payout);
          for (const [, value] of alloc) {
            expect(value).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * The core Model B rule. Two seats dealing identical damage at different bet
   * multipliers must NOT receive equal payouts, because that would decouple
   * payout from stake and break per-bet-multiplier RTP parity.
   */
  it('Property: equal damage at unequal stakes yields unequal allocation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
        fc.constantFrom(2, 5, 10, 20, 50, 100),
        (damage, higherTier) => {
          const contributions: Contribution[] = [
            { seatId: 1, betMultiplier: 1, damage },
            { seatId: 2, betMultiplier: higherTier, damage },
          ];
          // Give the remainder to seat 1 so it cannot mask the effect
          const alloc = allocateModelB(contributions, 1, 1000);
          expect(alloc.get(2)!).toBeGreaterThan(alloc.get(1)!);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('a naive damage-weighted allocation would wrongly pay equal shares', () => {
    // Documents the defect the invested-cost rule exists to prevent.
    const damage = 50;
    const naiveShare = (d: number, total: number, payout: number) => (payout * d) / total;
    const seat1 = naiveShare(damage, damage * 2, 1000);
    const seat2 = naiveShare(damage, damage * 2, 1000);
    expect(seat1).toBe(seat2);
  });
});

describe('Allocation invariants that must hold in production', () => {
  /**
   * This is the invariant the incident-report template requires as a runtime
   * check, because rounding errors here are individually tiny, collectively
   * material, and never generate a player complaint.
   */
  it('Property: sum of per-seat payouts equals amount owed for both models', () => {
    fc.assert(
      fc.property(
        contributionsArb,
        fc.integer({ min: 1, max: 500000 }),
        fc.boolean(),
        (contributions, payoutCents, useModelB) => {
          const payout = payoutCents / 100;
          const seats = [...new Set(contributions.map((c) => c.seatId))];
          const alloc = useModelB
            ? allocateModelB(contributions, seats[0], payout)
            : allocateModelA(contributions, seats[0], payout);
          expect(sumAllocations(alloc)).toBeCloseTo(payout, 8);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('Property: total damage recorded against a fish never exceeds its initial HP', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.array(fc.double({ min: 0.1, max: 5, noNaN: true, noDefaultInfinity: true }), {
          minLength: 1,
          maxLength: 400,
        }),
        (initialHp, damages) => {
          // Simulate the clamp a correct implementation must apply on the final blow
          let remaining = initialHp;
          let applied = 0;
          for (const d of damages) {
            if (remaining <= 0) break;
            const effective = Math.min(d, remaining);
            applied += effective;
            remaining -= effective;
          }
          expect(applied).toBeLessThanOrEqual(initialHp + 1e-9);
        }
      ),
      { numRuns: 200 }
    );
  });
});
