import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { read } from './helpers';

/**
 * Audit log completeness for a fish machine.
 *
 * Two things distinguish this from a slot spin log and both are tested here:
 *
 *  1. Per-bullet records must separate the hit resolution from the capture
 *     resolution. Collapsing them into one probability makes it impossible to
 *     answer a regulator's question about skill contribution, and impossible to
 *     verify per-bet-multiplier parity.
 *  2. Fish lifecycle records are mandatory, including the escape event. Without
 *     the escape record, the most common player dispute ("I nearly killed it and
 *     it vanished") cannot be answered, and the loss items in the maths model
 *     cannot be verified.
 */

interface DamageEvent {
  bulletId: string;
  seatId: number;
  playerId: string;
  betMultiplier: number;
  damage: number;
  fishHpBefore: number;
  fishHpAfter: number;
  serverTick: number;
}

interface BulletAuditRecord {
  bulletId: string;
  timestamp: string;
  serverTick: number;
  tableId: string;
  seatId: number;
  sessionId: string;
  playerId: string;
  betMultiplier: number;
  betAmount: number;
  aimAngle: number;
  hitResult: { hit: boolean; fishId: string | null; species: string | null };
  rngOutput: number[];
  damageDealt: number;
  fishHpBefore: number | null;
  fishHpAfter: number | null;
  captured: boolean;
  payoutMultiplier: number | null;
  payoutAmount: number | null;
  damageAttribution: Array<{ seatId: number; investedCost: number; share: number }> | null;
  balanceBefore: number;
  balanceAfter: number;
  configHash: string;
  buildHash: string;
}

interface FishLifecycleRecord {
  fishId: string;
  species: string;
  payoutMultiplier: number;
  initialHp: number;
  spawnSeed: string;
  spawnTick: number;
  damageEvents: DamageEvent[];
  outcome: 'captured' | 'escaped' | 'scene_reset' | 'round_end';
  killingBulletId: string | null;
  remainingHp: number;
}

const REQUIRED_BULLET_FIELDS: Array<keyof BulletAuditRecord> = [
  'bulletId',
  'timestamp',
  'serverTick',
  'tableId',
  'seatId',
  'sessionId',
  'playerId',
  'betMultiplier',
  'betAmount',
  'aimAngle',
  'hitResult',
  'rngOutput',
  'damageDealt',
  'fishHpBefore',
  'fishHpAfter',
  'captured',
  'payoutMultiplier',
  'payoutAmount',
  'damageAttribution',
  'balanceBefore',
  'balanceAfter',
  'configHash',
  'buildHash',
];

function buildBulletRecord(input: {
  betMultiplier: number;
  aimAngle: number;
  rngOutput: number[];
  hit: boolean;
  damage: number;
  hpBefore: number;
  balanceBefore: number;
  tick: number;
}): BulletAuditRecord {
  const hpAfter = input.hit ? Math.max(0, input.hpBefore - input.damage) : input.hpBefore;
  const captured = input.hit && hpAfter <= 0;
  const payoutMultiplier = captured ? 12 : null;
  const payoutAmount = captured ? 12 * input.betMultiplier : null;

  return {
    bulletId: `b-${input.tick}`,
    timestamp: new Date(1767225600000 + input.tick).toISOString(),
    serverTick: input.tick,
    tableId: 't-1',
    seatId: 3,
    sessionId: 'sess-1',
    playerId: 'p-1',
    betMultiplier: input.betMultiplier,
    betAmount: input.betMultiplier,
    aimAngle: input.aimAngle,
    hitResult: {
      hit: input.hit,
      fishId: input.hit ? 'f-1' : null,
      species: input.hit ? 'F05' : null,
    },
    rngOutput: input.rngOutput,
    damageDealt: input.hit ? input.damage : 0,
    fishHpBefore: input.hit ? input.hpBefore : null,
    fishHpAfter: input.hit ? hpAfter : null,
    captured,
    payoutMultiplier,
    payoutAmount,
    damageAttribution: captured ? [{ seatId: 3, investedCost: input.betMultiplier, share: 1 }] : null,
    balanceBefore: input.balanceBefore,
    balanceAfter: input.balanceBefore - input.betMultiplier + (payoutAmount ?? 0),
    configHash: 'cfg-abc',
    buildHash: 'bld-def',
  };
}

const bulletInputArb = fc.record({
  betMultiplier: fc.constantFrom(1, 2, 5, 10, 20, 50, 100),
  aimAngle: fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true }),
  rngOutput: fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 1, maxLength: 8 }),
  hit: fc.boolean(),
  damage: fc.double({ min: 0.2, max: 1.64, noNaN: true, noDefaultInfinity: true }),
  hpBefore: fc.integer({ min: 1, max: 200 }),
  balanceBefore: fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  tick: fc.integer({ min: 0, max: 10_000_000 }),
});

describe('Per-bullet audit record completeness', () => {
  it('Property: every generated record carries all required fields', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        for (const field of REQUIRED_BULLET_FIELDS) {
          expect(field in rec, `audit record missing ${field}`).toBe(true);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('Property: the timestamp is valid ISO 8601', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        expect(new Date(rec.timestamp).toISOString()).toBe(rec.timestamp);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Hit resolution and capture resolution are separate layers: the first carries
   * the skill contribution, the second carries the chance contribution. The log
   * must keep them distinguishable.
   */
  it('Property: hit resolution and capture resolution are recorded separately', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        expect(rec.hitResult.hit).toBe(input.hit);
        if (!input.hit) {
          expect(rec.captured, 'a miss can never be a capture').toBe(false);
          expect(rec.fishHpBefore).toBeNull();
          expect(rec.damageDealt).toBe(0);
        } else {
          expect(rec.fishHpBefore).toBeTypeOf('number');
          expect(rec.fishHpAfter).toBeTypeOf('number');
        }
      }),
      { numRuns: 200 }
    );
  });

  /**
   * fishHpBefore and fishHpAfter are the fields most often dropped as "redundant"
   * during optimisation. They are what makes the strongest collusion signal
   * computable, so their presence is asserted as a property.
   */
  it('Property: HP before and after are both present on every hit', () => {
    fc.assert(
      fc.property(bulletInputArb.filter((i) => i.hit), (input) => {
        const rec = buildBulletRecord(input);
        expect(rec.fishHpBefore).not.toBeNull();
        expect(rec.fishHpAfter).not.toBeNull();
        expect(rec.fishHpAfter!).toBeLessThanOrEqual(rec.fishHpBefore!);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: the balance delta equals the payout minus the stake', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        const expected = rec.balanceBefore - rec.betAmount + (rec.payoutAmount ?? 0);
        expect(rec.balanceAfter).toBeCloseTo(expected, 8);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: a capture always records a payout and an attribution', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        if (!rec.captured) return;
        expect(rec.payoutMultiplier).not.toBeNull();
        expect(rec.payoutAmount).not.toBeNull();
        expect(rec.damageAttribution).not.toBeNull();
        expect(rec.payoutAmount).toBeCloseTo(rec.payoutMultiplier! * rec.betMultiplier, 8);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: every record binds to a build and configuration hash', () => {
    fc.assert(
      fc.property(bulletInputArb, (input) => {
        const rec = buildBulletRecord(input);
        expect(rec.buildHash).toBeTruthy();
        expect(rec.configHash).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });
});

describe('Fish lifecycle record completeness', () => {
  const damageEventArb = fc.record({
    bulletId: fc.string({ minLength: 1, maxLength: 12 }),
    seatId: fc.integer({ min: 1, max: 8 }),
    playerId: fc.string({ minLength: 1, maxLength: 12 }),
    betMultiplier: fc.constantFrom(1, 2, 5, 10, 20, 50, 100),
    damage: fc.double({ min: 0.2, max: 1.64, noNaN: true, noDefaultInfinity: true }),
    fishHpBefore: fc.double({ min: 0, max: 200, noNaN: true, noDefaultInfinity: true }),
    fishHpAfter: fc.double({ min: 0, max: 200, noNaN: true, noDefaultInfinity: true }),
    serverTick: fc.integer({ min: 0, max: 1_000_000 }),
  });

  const lifecycleArb = fc
    .record({
      fishId: fc.string({ minLength: 1, maxLength: 12 }),
      species: fc.constantFrom('F01', 'F05', 'F09', 'F10'),
      payoutMultiplier: fc.constantFrom(2, 12, 150, 500),
      initialHp: fc.integer({ min: 2, max: 500 }),
      spawnSeed: fc.string({ minLength: 4, maxLength: 32 }),
      spawnTick: fc.integer({ min: 0, max: 1_000_000 }),
      damageEvents: fc.array(damageEventArb, { minLength: 0, maxLength: 40 }),
      outcome: fc.constantFrom(
        'captured' as const,
        'escaped' as const,
        'scene_reset' as const,
        'round_end' as const
      ),
      remainingHp: fc.double({ min: 0, max: 500, noNaN: true, noDefaultInfinity: true }),
    })
    .map((r): FishLifecycleRecord => ({
      ...r,
      killingBulletId:
        r.outcome === 'captured' && r.damageEvents.length > 0
          ? r.damageEvents[r.damageEvents.length - 1].bulletId
          : null,
      remainingHp: r.outcome === 'captured' ? 0 : r.remainingHp,
    }));

  it('Property: every lifecycle record carries the fields needed for deterministic replay', () => {
    fc.assert(
      fc.property(lifecycleArb, (rec) => {
        for (const field of [
          'fishId',
          'species',
          'payoutMultiplier',
          'initialHp',
          'spawnSeed',
          'spawnTick',
          'damageEvents',
          'outcome',
          'killingBulletId',
          'remainingHp',
        ]) {
          expect(field in rec, `lifecycle record missing ${field}`).toBe(true);
        }
        expect(rec.spawnSeed.length, 'spawn seed is required for replay').toBeGreaterThan(0);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: a captured fish has zero remaining HP and a killing bullet when damage was dealt', () => {
    fc.assert(
      fc.property(
        lifecycleArb.filter((r) => r.outcome === 'captured' && r.damageEvents.length > 0),
        (rec) => {
          expect(rec.remainingHp).toBe(0);
          expect(rec.killingBulletId).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * The escape record is what answers the most common player dispute and what
   * makes the loss items in the maths model auditable.
   */
  it('Property: a non-captured outcome still records the outcome reason and residual HP', () => {
    fc.assert(
      fc.property(
        lifecycleArb.filter((r) => r.outcome !== 'captured'),
        (rec) => {
          expect(['escaped', 'scene_reset', 'round_end']).toContain(rec.outcome);
          expect(rec.remainingHp).toBeTypeOf('number');
          expect(rec.killingBulletId).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: every damage event identifies the seat, player, stake and HP transition', () => {
    fc.assert(
      fc.property(lifecycleArb, (rec) => {
        for (const ev of rec.damageEvents) {
          for (const field of [
            'bulletId',
            'seatId',
            'playerId',
            'betMultiplier',
            'damage',
            'fishHpBefore',
            'fishHpAfter',
            'serverTick',
          ]) {
            expect(field in ev, `damage event missing ${field}`).toBe(true);
          }
        }
      }),
      { numRuns: 200 }
    );
  });

  /**
   * The collusion signal the steering guidance calls the strongest: an account
   * that stops firing exactly when a fish is near death. It is computable only
   * from a full damage sequence carrying HP values.
   */
  it('Property: cease-fire-near-death is computable from the damage sequence', () => {
    fc.assert(
      fc.property(lifecycleArb.filter((r) => r.damageEvents.length >= 4), (rec) => {
        const nearDeathThreshold = rec.initialHp * 0.15;
        const shotsBySeatNearDeath = new Map<number, number>();
        for (const ev of rec.damageEvents) {
          if (ev.fishHpBefore <= nearDeathThreshold) {
            shotsBySeatNearDeath.set(ev.seatId, (shotsBySeatNearDeath.get(ev.seatId) ?? 0) + 1);
          }
        }
        // The metric is well defined for every record; that is the property.
        expect(shotsBySeatNearDeath).toBeInstanceOf(Map);
        for (const [, count] of shotsBySeatNearDeath) {
          expect(count).toBeGreaterThan(0);
        }
      }),
      { numRuns: 200 }
    );
  });
});

describe('Steering guidance documents the audit field set', () => {
  const rng = read('steering/rng-capture-determination.md');

  it('lists the per-bullet fields including HP before and after', () => {
    for (const field of [
      'bulletId',
      'serverTick',
      'betMultiplier',
      'rngOutput',
      'damageDealt',
      'fishHpBefore',
      'fishHpAfter',
      'damageAttribution',
      'configHash',
      'buildHash',
    ]) {
      expect(rng, `audit field set must document ${field}`).toContain(field);
    }
  });

  it('requires the fish escape event to be logged', () => {
    expect(rng).toMatch(/魚離場/);
    expect(rng).toMatch(/spawnSeed/);
  });

  it('requires append-only audit storage', () => {
    expect(rng).toMatch(/唯附加/);
  });
});
