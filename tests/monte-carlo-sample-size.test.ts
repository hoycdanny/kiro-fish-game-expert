import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Monte Carlo sample size derivation.
 *
 * The steering guidance rejects the industry habit of "run ten million spins" and
 * requires the sample size to be derived from a MEASURED per-bullet standard
 * deviation and a target precision:
 *
 *   n >= (z * sigma / epsilon)^2
 *
 * This matters more for fish machines than for slots because the per-bullet return
 * distribution is extremely skewed: most bullets return nothing and a few return a
 * large multiple of the stake, so sigma is much larger.
 */

function requiredSamples(sigma: number, epsilon: number, z = 1.96): number {
  return Math.ceil((z * sigma / epsilon) ** 2);
}

/**
 * Per-bullet return standard deviation for a given species mix, expressed in
 * units of the stake. Derived from the definition of variance for a discrete
 * random variable whose outcomes are the payout multipliers.
 */
function perBulletSigma(
  outcomes: Array<{ probability: number; payoutMultiplier: number }>
): number {
  const mean = outcomes.reduce((s, o) => s + o.probability * o.payoutMultiplier, 0);
  const second = outcomes.reduce((s, o) => s + o.probability * o.payoutMultiplier ** 2, 0);
  return Math.sqrt(Math.max(0, second - mean ** 2));
}

describe('Sample size derivation', () => {
  it('Property: required samples grow with the square of sigma', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 20, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.0001, max: 0.01, noNaN: true, noDefaultInfinity: true }),
        (sigma, epsilon) => {
          const n1 = requiredSamples(sigma, epsilon);
          const n2 = requiredSamples(sigma * 2, epsilon);
          expect(n2 / n1).toBeCloseTo(4, 0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: required samples grow with the inverse square of the target precision', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 20, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.0002, max: 0.01, noNaN: true, noDefaultInfinity: true }),
        (sigma, epsilon) => {
          const loose = requiredSamples(sigma, epsilon);
          const tight = requiredSamples(sigma, epsilon / 2);
          expect(tight / loose).toBeCloseTo(4, 0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: the derived sample size achieves the requested precision', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 10, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.0005, max: 0.01, noNaN: true, noDefaultInfinity: true }),
        (sigma, epsilon) => {
          const n = requiredSamples(sigma, epsilon);
          const halfWidth = (1.96 * sigma) / Math.sqrt(n);
          expect(halfWidth).toBeLessThanOrEqual(epsilon * 1.0000001);
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Fish machine skew makes folklore sample sizes inadequate', () => {
  /**
   * A high-volatility fish configuration with a ×500 BOSS produces a sigma far
   * above a typical slot's. The classic "ten million rounds" heuristic then fails
   * to reach a 0.1 percentage point precision, which is the concrete reason the
   * guidance insists on deriving n from measured sigma.
   */
  const highVolatilityOutcomes = [
    { probability: 0.18, payoutMultiplier: 2 },
    { probability: 0.06, payoutMultiplier: 5 },
    { probability: 0.02, payoutMultiplier: 12 },
    { probability: 0.006, payoutMultiplier: 40 },
    { probability: 0.0012, payoutMultiplier: 150 },
    { probability: 0.00004, payoutMultiplier: 500 },
  ];

  it('a high-volatility fish configuration has a large per-bullet sigma', () => {
    const sigma = perBulletSigma(highVolatilityOutcomes);
    expect(sigma).toBeGreaterThan(2);
  });

  it('ten million bullets does not reach 0.1 percentage point precision', () => {
    const sigma = perBulletSigma(highVolatilityOutcomes);
    const needed = requiredSamples(sigma, 0.001);
    expect(needed).toBeGreaterThan(10_000_000);
  });

  it('Property: adding a rarer, larger prize always increases the required sample size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 200, max: 5000 }),
        fc.double({ min: 1e-6, max: 1e-4, noNaN: true, noDefaultInfinity: true }),
        (jackpotMultiplier, jackpotProbability) => {
          const base = perBulletSigma(highVolatilityOutcomes);
          const withJackpot = perBulletSigma([
            ...highVolatilityOutcomes,
            { probability: jackpotProbability, payoutMultiplier: jackpotMultiplier },
          ]);
          expect(withJackpot).toBeGreaterThan(base);
          expect(requiredSamples(withJackpot, 0.001)).toBeGreaterThan(
            requiredSamples(base, 0.001)
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Stratified sampling is required because a main simulation sized for the base
   * layer contains too few BOSS events to estimate that layer at all.
   */
  it('a main simulation sized for the base layer under-samples a rare BOSS event', () => {
    const sigma = perBulletSigma(highVolatilityOutcomes);
    const mainRuns = requiredSamples(sigma, 0.001);
    const bossEntryFrequency = 1 / 100_000;
    const bossEvents = mainRuns * bossEntryFrequency;
    // Far too few events to estimate a layer contributing ~3% of RTP precisely
    expect(bossEvents).toBeLessThan(20_000);
  });

  it('Property: rarer events always need proportionally more main-simulation rounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000 }),
        fc.integer({ min: 1000, max: 100_000 }),
        (frequencyDenominator, targetEvents) => {
          const runsNeeded = frequencyDenominator * targetEvents;
          expect(runsNeeded).toBeGreaterThanOrEqual(targetEvents);
          expect(runsNeeded / targetEvents).toBe(frequencyDenominator);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Consistency judgement between theory and simulation', () => {
  function withinConfidenceInterval(
    theoretical: number,
    simulated: number,
    sigma: number,
    n: number,
    z = 1.96
  ): boolean {
    return Math.abs(theoretical - simulated) <= (z * sigma) / Math.sqrt(n);
  }

  it('Property: a simulated value inside the interval is judged consistent', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.8, max: 1.0, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 6, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 1_000_000, max: 500_000_000 }),
        (theoretical, sigma, n) => {
          const halfWidth = (1.96 * sigma) / Math.sqrt(n);
          const simulated = theoretical + halfWidth * 0.5;
          expect(withinConfidenceInterval(theoretical, simulated, sigma, n)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('Property: a systematic offset is judged inconsistent regardless of sample size', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.8, max: 1.0, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 6, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 50_000_000, max: 500_000_000 }),
        (theoretical, sigma, n) => {
          // A 1 percentage point systematic bias, e.g. from integer truncation of damage
          const simulated = theoretical - 0.01;
          expect(withinConfidenceInterval(theoretical, simulated, sigma, n)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });
});
