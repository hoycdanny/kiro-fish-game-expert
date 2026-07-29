import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readJson } from './helpers';

/**
 * RTP composition for a fish machine.
 *
 * Total RTP is the sum of the base species layer and every feature layer. Two
 * fish-specific errors are encoded here as tests:
 *
 *  1. A special weapon's RTP contribution must be divided by the cost of
 *     ACQUIRING the weapon, not by the cost of the bullet that triggered it.
 *     Using the trigger bullet as the denominator overstates RTP, often by
 *     several percentage points.
 *  2. Loss items (fish escaping with accumulated damage, scene resets) are
 *     unrecovered cost. Omitting them makes theoretical RTP exceed actual RTP.
 */

function totalRtp(baseLayer: number, featureLayers: number[]): number {
  return baseLayer + featureLayers.reduce((a, b) => a + b, 0);
}

function weaponRtpContribution(
  triggerProbability: number,
  averageReturnPerActivation: number,
  acquisitionCost: number
): number {
  return (triggerProbability * averageReturnPerActivation) / acquisitionCost;
}

describe('RTP composition invariants', () => {
  it('Property: total RTP equals the base layer plus the sum of all feature layers', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
        fc.array(fc.double({ min: 0, max: 0.2, noNaN: true, noDefaultInfinity: true }), {
          minLength: 0,
          maxLength: 6,
        }),
        (base, features) => {
          const total = totalRtp(base, features);
          expect(total).toBeCloseTo(base + features.reduce((a, b) => a + b, 0), 10);
          expect(total).toBeGreaterThanOrEqual(base - 1e-12);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * The acquisition-cost denominator rule, stated as a property: using the single
   * trigger bullet as the denominator always overstates the contribution whenever
   * acquiring the weapon costs more than one bullet.
   */
  it('Property: using the trigger bullet as denominator overstates weapon RTP contribution', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.0001, max: 1, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.1, max: 5000, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 2, max: 2000 }),
        (triggerProbability, averageReturn, acquisitionCost) => {
          const correct = weaponRtpContribution(
            triggerProbability,
            averageReturn,
            acquisitionCost
          );
          const wrong = weaponRtpContribution(triggerProbability, averageReturn, 1);
          expect(wrong).toBeGreaterThan(correct);
          expect(wrong / correct).toBeCloseTo(acquisitionCost, 6);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Loss items reduce realised RTP. A model that ignores them reports a value
   * that can never be achieved in production.
   */
  it('Property: omitting loss items makes theoretical RTP exceed realised RTP', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 1.2, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.0001, max: 0.3, noNaN: true, noDefaultInfinity: true }),
        (rtpIgnoringLoss, unrecoveredCostShare) => {
          const realised = rtpIgnoringLoss * (1 - unrecoveredCostShare);
          expect(realised).toBeLessThan(rtpIgnoringLoss);
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Shipped RTP breakdown is internally consistent', () => {
  const table = readJson<Record<string, any>>(
    'templates/species-payout/ocean-hunter-8-seat-96rtp.json'
  );
  const breakdown = table.rtpBreakdown as Record<string, unknown>;

  const numericLayers = Object.entries(breakdown).filter(
    ([key, value]) => typeof value === 'number' && key !== 'total'
  ) as Array<[string, number]>;

  it('declares a base species layer plus at least five feature layers', () => {
    expect(breakdown.baseSpecies).toBeTypeOf('number');
    expect(numericLayers.length).toBeGreaterThanOrEqual(6);
  });

  it('covers every feature the table actually ships', () => {
    for (const layer of ['baseSpecies', 'laser', 'freeze', 'lockOn', 'boss', 'crossTablePool']) {
      expect(breakdown[layer], `rtpBreakdown must include ${layer}`).toBeTypeOf('number');
    }
  });

  it('the layers sum to the declared total', () => {
    const sum = numericLayers.reduce((acc, [, v]) => acc + v, 0);
    expect(sum).toBeCloseTo(breakdown.total as number, 4);
  });

  it('the declared total equals the table target RTP', () => {
    expect(breakdown.total).toBe(table.targetMetrics.rtp);
    expect(breakdown.total).toBeCloseTo(0.96, 6);
  });

  it('the cross-table pool contribution equals its contribution rate', () => {
    expect(table.crossTablePool.rtpContribution).toBeCloseTo(
      table.crossTablePool.contributionRate,
      10
    );
  });

  it('every special weapon states the acquisition-cost denominator', () => {
    for (const w of table.specialWeapons as any[]) {
      expect(w.rtpContribution, `${w.name} rtpContribution`).toBeTypeOf('number');
      expect(w.denominatorBasis, `${w.name} denominatorBasis`).toMatch(/取得|全部成本/);
    }
  });

  it('the special weapon contributions in the breakdown match the weapon list', () => {
    const weapons = table.specialWeapons as any[];
    const weaponSum = weapons.reduce((acc, w) => acc + w.rtpContribution, 0);
    const breakdownWeaponSum =
      (breakdown.laser as number) + (breakdown.freeze as number) + (breakdown.lockOn as number);
    expect(weaponSum).toBeCloseTo(breakdownWeaponSum, 6);
  });

  it('loss items are enumerated and marked as included in the model', () => {
    const lossItems = table.lossItems as any[];
    expect(lossItems.length).toBeGreaterThanOrEqual(3);
    const serialised = JSON.stringify(lossItems);
    expect(serialised).toMatch(/魚離場/);
    expect(serialised).toMatch(/場景重置/);
    for (const item of lossItems) {
      expect(item.included, `loss item "${item.item}" must be included in the model`).toBe(true);
    }
  });

  /**
   * The base species layer is strategy-dependent: the targeting weights come from
   * the player, not the configuration. The shipped table must therefore show its
   * derivation rather than assert a bare number.
   */
  it('the base species layer is derived from targeting weights and a hit rate', () => {
    const t = table.targetingWeightsTypicalStrategy;
    const weights = Object.values(t.weights) as number[];
    const weightSum = weights.reduce((a, b) => a + b, 0);
    expect(weightSum).toBeCloseTo(1, 4);

    expect(t.hitRate).toBeGreaterThan(0);
    expect(t.hitRate).toBeLessThanOrEqual(1);
    expect(t.derivedBaseSpeciesRtp).toBeCloseTo(t.hitRate * t.weightedReturnRate, 3);
    expect(t.derivedBaseSpeciesRtp).toBeCloseTo(breakdown.baseSpecies as number, 4);
  });

  it('the weighted return rate matches the per-species return rates under those weights', () => {
    const t = table.targetingWeightsTypicalStrategy;
    const species = table.species as any[];
    const byId = new Map(species.map((s) => [s.id, s]));

    let weighted = 0;
    for (const [id, weight] of Object.entries(t.weights as Record<string, number>)) {
      const s = byId.get(id);
      expect(s, `targeting weight references unknown species ${id}`).toBeDefined();
      weighted += weight * s.expectedReturnRatePerHit;
    }
    expect(weighted).toBeCloseTo(t.weightedReturnRate, 3);
  });
});
