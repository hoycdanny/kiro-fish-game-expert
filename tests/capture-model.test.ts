import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readJson } from './helpers';

/**
 * Capture model derivation and independence.
 *
 * For the stochastic-HP model:
 *   expectedBulletsToCapture = baseHp / expectedDamage
 *   expectedReturnRate       = payoutMultiplier × expectedDamage / baseHp
 *
 * The shipped worked example must satisfy both, and the model must forbid every
 * form of history dependence, because history dependence is compensated payout
 * control and that is an architecture violation rather than a tuning problem.
 */

interface Derivation {
  speciesId: string;
  speciesName: string;
  baseHp: number;
  expectedDamage: number;
  expectedBulletsToCapture: number;
  payoutMultiplier: number;
  expectedReturnRate: number;
}

const model = readJson<Record<string, any>>(
  'templates/capture-model/weighted-hp-medium-volatility.json'
);
const derivations = model.perSpeciesDerivation as Derivation[];

describe('Capture model derivation formulas', () => {
  it('Property: expected bullets to capture equals HP divided by expected damage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2000 }),
        fc.double({ min: 0.05, max: 10, noNaN: true, noDefaultInfinity: true }),
        (hp, expectedDamage) => {
          const bullets = hp / expectedDamage;
          expect(bullets).toBeGreaterThan(0);
          // Doubling the expected damage halves the bullets required
          expect(hp / (expectedDamage * 2)).toBeCloseTo(bullets / 2, 10);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: expected return rate is payout multiplier times damage over HP', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 1000 }),
        fc.integer({ min: 1, max: 2000 }),
        fc.double({ min: 0.05, max: 10, noNaN: true, noDefaultInfinity: true }),
        (payoutMultiplier, hp, expectedDamage) => {
          const rate = (payoutMultiplier * expectedDamage) / hp;
          const bullets = hp / expectedDamage;
          // Return rate is equivalently payout divided by expected bullets
          expect(rate).toBeCloseTo(payoutMultiplier / bullets, 8);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * When payout multiplier and HP are proportional, every species has the same
   * expected return rate. This is the design principle that makes per-bet-multiplier
   * parity easy to hold and keeps the skill spread controllable.
   */
  it('Property: proportional payout and HP yields a uniform return rate across species', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 3, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 1.2, noNaN: true, noDefaultInfinity: true }),
        fc.array(fc.integer({ min: 2, max: 500 }), { minLength: 2, maxLength: 12 }),
        (expectedDamage, ratio, multipliers) => {
          const rates = multipliers.map((m) => {
            const hp = (m * expectedDamage) / ratio;
            return (m * expectedDamage) / hp;
          });
          for (const r of rates) {
            expect(r).toBeCloseTo(ratio, 8);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Shipped capture model correctness', () => {
  it('declares the stochastic-HP model type', () => {
    expect(model.modelType).toBe('stochastic-hp');
  });

  it('declares a damage distribution with an expected value', () => {
    const dd = model.damageDistribution;
    expect(dd.type).toBeTruthy();
    expect(dd.parameters).toBeDefined();
    expect(dd.expectedDamage).toBeTypeOf('number');
    expect(dd.expectedDamage).toBeGreaterThan(0);
  });

  it('the declared expected damage sits within the distribution support', () => {
    const dd = model.damageDistribution;
    expect(dd.expectedDamage).toBeGreaterThanOrEqual(dd.parameters.minDamage);
    expect(dd.expectedDamage).toBeLessThanOrEqual(dd.parameters.maxDamage);
  });

  it('the discrete uniform expected damage is the midpoint of its support', () => {
    const dd = model.damageDistribution;
    const midpoint = (dd.parameters.minDamage + dd.parameters.maxDamage) / 2;
    expect(dd.expectedDamage).toBeCloseTo(midpoint, 6);
  });

  it('lists a derivation for at least nine species', () => {
    expect(derivations.length).toBeGreaterThanOrEqual(9);
  });

  it('Property: every derivation row recomputes correctly from HP and expected damage', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: derivations.length - 1 }), (index) => {
        const d = derivations[index];
        expect(d.expectedDamage, `${d.speciesId} expectedDamage`).toBe(
          model.damageDistribution.expectedDamage
        );

        const bullets = d.baseHp / d.expectedDamage;
        expect(
          d.expectedBulletsToCapture,
          `${d.speciesId} expectedBulletsToCapture should be ${bullets}`
        ).toBeCloseTo(bullets, 2);

        const rate = (d.payoutMultiplier * d.expectedDamage) / d.baseHp;
        expect(
          d.expectedReturnRate,
          `${d.speciesId} expectedReturnRate should be ${rate}`
        ).toBeCloseTo(rate, 3);
      }),
      { numRuns: 100 }
    );
  });

  it('return rates stay below 1 so no species is individually profitable per hit', () => {
    for (const d of derivations) {
      expect(d.expectedReturnRate, `${d.speciesId} return rate`).toBeLessThanOrEqual(1);
    }
  });

  it('the derivation matches the shipped species payout table', () => {
    const table = readJson<Record<string, any>>(
      'templates/species-payout/ocean-hunter-8-seat-96rtp.json'
    );
    const bySpeciesId = new Map((table.species as any[]).map((s) => [s.id, s]));

    for (const d of derivations) {
      const s = bySpeciesId.get(d.speciesId);
      expect(s, `capture model references unknown species ${d.speciesId}`).toBeDefined();
      expect(s.baseHp, `${d.speciesId} HP mismatch between templates`).toBe(d.baseHp);
      expect(s.payoutMultiplier, `${d.speciesId} payout mismatch`).toBe(d.payoutMultiplier);
      expect(s.expectedReturnRatePerHit, `${d.speciesId} return rate mismatch`).toBeCloseTo(
        d.expectedReturnRate,
        4
      );
    }
  });
});

describe('Capture model independence constraints', () => {
  const constraints = (model.independenceConstraints as string[]).join('\n');

  /**
   * These four dependencies are the definition of compensated payout control.
   * If the model does not forbid them explicitly, a reader can reintroduce them.
   */
  it('forbids dependence on player history, cumulative stake, RTP deviation and balance', () => {
    for (const forbidden of ['玩家歷史', '累積投入', 'RTP 偏差', '帳戶餘額']) {
      expect(constraints, `independenceConstraints must forbid ${forbidden}`).toContain(forbidden);
    }
  });

  it('permits only the remaining HP of the fish as judgement state', () => {
    expect(constraints).toMatch(/剩餘生命值/);
  });

  it('names the two compensation patterns that masquerade as player-friendly features', () => {
    const prohibited = JSON.stringify(model.prohibitedPatterns);
    expect(prohibited, 'must name 保底 as a violation').toMatch(/保底/);
    expect(prohibited, 'must name 記血 as a violation').toMatch(/記血/);
  });

  it('classifies every prohibited pattern as an architecture violation', () => {
    for (const p of model.prohibitedPatterns as any[]) {
      expect(p.reason, `${p.pattern} needs a reason`).toBeTruthy();
      expect(p.verdict, `${p.pattern} verdict`).toBe('架構違規');
    }
  });

  /**
   * The pure-function signature is the strongest available evidence of
   * independence at submission time, stronger than any prose assurance.
   */
  it('publishes a pure judgement function signature with no history parameter', () => {
    const sig = model.pureFunctionSignature.signature as string;
    expect(sig).toMatch(/resolveCapture/);
    expect(sig).toMatch(/fishState/);
    expect(sig).toMatch(/betMultiplier/);
    expect(sig).toMatch(/rngBytes/);
    expect(sig).not.toMatch(/history|cumulative|累積|playerStats/i);
  });

  it('names the prohibited non-cryptographic RNG sources', () => {
    const prohibited = (model.rngRequirements.prohibitedSources as string[]).join(' ');
    for (const src of ['Math.random()', 'System.Random', 'FMath::RandRange', 'rand()']) {
      expect(prohibited, `must prohibit ${src}`).toContain(src);
    }
  });

  it('requires batch sampling to be disclosed so it is not mistaken for a home-made PRNG', () => {
    expect(model.rngRequirements.batchSampling).toMatch(/CSPRNG/);
    expect(model.rngRequirements.batchSampling).toMatch(/揭露/);
  });

  it('requires the three behavioural verification tests', () => {
    const reqs = (model.verificationRequirements as string[]).join('\n');
    expect(reqs).toMatch(/長期漂移/);
    expect(reqs).toMatch(/注入偏差/);
    expect(reqs).toMatch(/狀態隔離/);
  });

  it('requires simulation to run the product judgement code, not a simplified model', () => {
    const reqs = (model.verificationRequirements as string[]).join('\n');
    expect(reqs).toMatch(/實際的判定程式碼/);
    expect(reqs).toMatch(/簡化版/);
  });
});
