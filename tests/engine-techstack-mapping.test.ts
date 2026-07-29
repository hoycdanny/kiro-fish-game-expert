import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { read } from './helpers';

/**
 * Engine to tech stack and CSPRNG mapping.
 *
 * The mapping is asserted against POWER.md so the documentation and the Power's
 * behaviour cannot drift apart. The CSPRNG column matters more than the language
 * column: recommending a non-cryptographic source for capture determination is
 * the highest-severity red flag in this domain.
 */

const ENGINE_LANGUAGE: Record<string, string> = {
  Unity: 'C#',
  'Cocos Creator': 'TypeScript',
  'Unreal Engine': 'C++/Blueprint',
  Godot: 'GDScript/C#',
  'HTML5/PixiJS': 'JavaScript/TypeScript',
};

const ENGINE_CSPRNG: Record<string, string> = {
  Unity: 'System.Security.Cryptography.RandomNumberGenerator',
  'Cocos Creator': 'crypto.randomBytes()',
  'Unreal Engine': 'RAND_bytes()',
  Godot: 'Crypto.generate_random_bytes()',
  'HTML5/PixiJS': 'crypto.getRandomValues()',
};

const PROHIBITED_SOURCES = [
  'Math.random()',
  'System.Random',
  'FMath::RandRange',
  'rand()',
];

function recommendedLanguage(engine: string): string | undefined {
  return Object.hasOwn(ENGINE_LANGUAGE, engine) ? ENGINE_LANGUAGE[engine] : undefined;
}

const KNOWN_ENGINES = Object.keys(ENGINE_LANGUAGE);
const powerMd = read('POWER.md');
const rngSteering = read('steering/rng-capture-determination.md');

describe('Engine to language mapping', () => {
  it('Property: every known engine maps to exactly the documented language', () => {
    fc.assert(
      fc.property(fc.constantFrom(...KNOWN_ENGINES), (engine) => {
        const recommended = recommendedLanguage(engine);
        expect(recommended).toBeDefined();
        expect(recommended).toBe(ENGINE_LANGUAGE[engine]);
      }),
      { numRuns: 100 }
    );
  });

  it('Property: an unknown engine yields no recommendation rather than a guess', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !KNOWN_ENGINES.includes(s)),
        (unknown) => {
          expect(recommendedLanguage(unknown)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('POWER.md documents every engine in the mapping', () => {
    for (const engine of KNOWN_ENGINES) {
      expect(powerMd, `POWER.md must document ${engine}`).toContain(engine);
    }
  });

  it('POWER.md documents the language for every engine', () => {
    for (const [engine, language] of Object.entries(ENGINE_LANGUAGE)) {
      expect(powerMd, `POWER.md must state ${language} for ${engine}`).toContain(language);
    }
  });
});

describe('Engine to CSPRNG mapping', () => {
  it('POWER.md names a cryptographic source for every engine', () => {
    for (const [engine, api] of Object.entries(ENGINE_CSPRNG)) {
      expect(powerMd, `POWER.md must name ${api} for ${engine}`).toContain(api);
    }
  });

  it('the RNG steering file names a cryptographic source for every engine', () => {
    for (const [engine, api] of Object.entries(ENGINE_CSPRNG)) {
      expect(rngSteering, `RNG guidance must name ${api} for ${engine}`).toContain(api);
    }
  });

  it('Property: no engine is mapped to a prohibited source', () => {
    fc.assert(
      fc.property(fc.constantFrom(...KNOWN_ENGINES), (engine) => {
        const api = ENGINE_CSPRNG[engine];
        for (const prohibited of PROHIBITED_SOURCES) {
          expect(api, `${engine} must not use ${prohibited}`).not.toBe(prohibited);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('the RNG steering file explicitly prohibits every non-cryptographic source', () => {
    for (const prohibited of PROHIBITED_SOURCES) {
      expect(rngSteering, `RNG guidance must prohibit ${prohibited}`).toContain(prohibited);
    }
  });

  /**
   * Client-side randomness is acceptable for cosmetics only. The guidance must say
   * so, because a browser CSPRNG is genuinely cryptographic yet still unacceptable
   * for deciding an outcome on the client.
   */
  it('the RNG steering file restricts browser CSPRNG to non-outcome purposes', () => {
    expect(rngSteering).toMatch(/僅供離線工具與視覺用途|僅非結果性用途|不得參與捕獲判定/);
  });

  it('the RNG steering file documents server-side sources for the authoritative path', () => {
    for (const server of ['crypto.randomBytes()', 'crypto/rand', 'secrets']) {
      expect(rngSteering, `must document server-side source ${server}`).toContain(server);
    }
  });

  /**
   * Batch sampling is the correct answer to the performance pressure a fish
   * machine creates. Without it documented, teams reach for a weak PRNG.
   */
  it('the RNG steering file offers batch sampling as the performance answer', () => {
    expect(rngSteering).toMatch(/批次取樣/);
    expect(rngSteering).toMatch(/不得回退到非密碼學來源/);
  });
});
