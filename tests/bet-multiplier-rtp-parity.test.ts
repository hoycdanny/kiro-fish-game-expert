import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readJson } from './helpers';

/**
 * Per-bet-multiplier RTP parity.
 *
 * This is the single most commonly failed invariant in fish machine submissions.
 * The industry habit of making the biggest cannon harder to score with ("大砲難打")
 * produces a lower RTP at higher stakes, which is a rejection cause.
 *
 * The mathematical reason parity holds is that the payout multiplier and the bet
 * multiplier both appear in the expected return and in the cost, so they cancel:
 *
 *   RTP = Σ P(hit_i) × P(capture | hit_i) × payoutMultiplier_i
 *
 * The bet multiplier does not appear. Therefore ANY implementation in which the
 * capture probability varies with the bet multiplier breaks parity.
 */

interface Tier {
  betMultiplier: number;
  costPerBullet: number;
  theoreticalRtp: number;
  maxSinglePayout: number;
}

/**
 * Compute RTP for one bullet from the capture model, deliberately taking the bet
 * multiplier as a parameter so the test can prove it has no effect.
 */
function bulletRtp(
  betMultiplier: number,
  hitRate: number,
  targeting: Array<{ weight: number; payoutMultiplier: number; expectedDamage: number; hp: number }>
): number {
  const expectedReturn = targeting.reduce((sum, s) => {
    const captureProbabilityPerHit = s.expectedDamage / s.hp;
    return sum + s.weight * captureProbabilityPerHit * s.payoutMultiplier * betMultiplier;
  }, 0);
  const cost = betMultiplier;
  return (hitRate * expectedReturn) / cost;
}

const speciesArb = fc.record({
  weight: fc.double({ min: 0.01, max: 1, noNaN: true, noDefaultInfinity: true }),
  payoutMultiplier: fc.integer({ min: 2, max: 500 }),
  hp: fc.integer({ min: 2, max: 600 }),
  expectedDamage: fc.double({ min: 0.1, max: 3, noNaN: true, noDefaultInfinity: true }),
});

describe('Per-bet-multiplier RTP parity', () => {
  /**
   * Property: for any species configuration and any two bet multipliers, RTP is
   * identical. This encodes why "大砲難打" is a defect rather than a design choice.
   */
  it('Property: RTP is invariant under the bet multiplier', () => {
    fc.assert(
      fc.property(
        fc.array(speciesArb, { minLength: 1, maxLength: 10 }),
        fc.double({ min: 0.05, max: 1, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (species, hitRate, tierA, tierB) => {
          // Normalise targeting weights so they form a distribution
          const total = species.reduce((s, x) => s + x.weight, 0);
          const targeting = species.map((s) => ({ ...s, weight: s.weight / total }));

          const rtpA = bulletRtp(tierA, hitRate, targeting);
          const rtpB = bulletRtp(tierB, hitRate, targeting);

          expect(rtpA).toBeCloseTo(rtpB, 10);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * The converse: if capture probability is made to depend on the bet multiplier,
   * parity breaks. This test documents the defect rather than the correct design,
   * so that the invariant above is understood to be substantive.
   */
  it('Property: making capture probability depend on the bet multiplier breaks parity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 500 }),
        fc.integer({ min: 2, max: 600 }),
        (payoutMultiplier, hp) => {
          // A "big cannon is harder" implementation: damage scaled down as stake rises
          const rtpAtTier = (tier: number) => {
            const expectedDamage = 1 / Math.sqrt(tier);
            return (expectedDamage / hp) * payoutMultiplier;
          };
          expect(rtpAtTier(1)).toBeGreaterThan(rtpAtTier(100));
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Shipped species payout table honours parity', () => {
  const table = readJson<Record<string, any>>(
    'templates/species-payout/ocean-hunter-8-seat-96rtp.json'
  );
  const tiers = table.betMultiplierTiers as Tier[];

  it('declares an 8-seat table targeting 96% RTP', () => {
    expect(table.tableConfig.seats).toBe(8);
    expect(table.targetMetrics.rtp).toBe(0.96);
  });

  it('lists at least five bet multiplier tiers', () => {
    expect(tiers.length).toBeGreaterThanOrEqual(5);
  });

  it('Property: every tier declares exactly the same theoretical RTP', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: tiers.length - 1 }),
        fc.integer({ min: 0, max: tiers.length - 1 }),
        (i, j) => {
          expect(
            tiers[i].theoreticalRtp,
            `tier ×${tiers[i].betMultiplier} and ×${tiers[j].betMultiplier} must have equal RTP`
          ).toBe(tiers[j].theoreticalRtp);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every tier RTP equals the table target', () => {
    for (const t of tiers) {
      expect(t.theoreticalRtp, `tier ×${t.betMultiplier}`).toBe(0.96);
    }
    expect(table.betMultiplierParity.allTiersEqual).toBe(true);
    expect(table.betMultiplierParity.value).toBe(0.96);
  });

  it('cost per bullet scales linearly with the bet multiplier', () => {
    for (const t of tiers) {
      expect(t.costPerBullet, `tier ×${t.betMultiplier} cost`).toBe(t.betMultiplier);
    }
  });

  it('maximum single payout scales linearly with the bet multiplier', () => {
    const perUnit = tiers.map((t) => t.maxSinglePayout / t.betMultiplier);
    for (const value of perUnit) {
      expect(value).toBeCloseTo(perUnit[0], 6);
    }
  });

  it('records that the capture model is independent of the bet multiplier', () => {
    const model = readJson<Record<string, any>>(
      'templates/capture-model/weighted-hp-medium-volatility.json'
    );
    expect(model.betMultiplierIndependence.captureProbabilityDependsOnBetMultiplier).toBe(false);
  });
});
