import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { repoRoot, steeringFiles } from './helpers';

/**
 * Hook / steering synchronisation.
 *
 * The auto-guidance hook is what routes a user question to the right steering
 * file. When a steering file is added but the hook is not updated, that guidance
 * becomes unreachable and the failure is completely silent — the Power simply
 * answers without the knowledge it has on disk. That is the exact defect this
 * suite exists to prevent.
 */

const steering = steeringFiles();
const hooksDir = path.join(repoRoot, 'hooks');

interface LoadedHook {
  file: string;
  raw: string;
  prompt: string;
}

function extractPrompt(raw: string): string {
  const parsed = JSON.parse(raw);

  // v1 agent-hook format: { version, hooks: [ { action: { type, prompt } } ] }
  if (Array.isArray(parsed.hooks)) {
    return parsed.hooks.map((h: any) => h.action?.prompt ?? '').join('\n');
  }

  // legacy .kiro.hook format: { when, then: { type, prompt } }
  return parsed.then?.prompt ?? '';
}

const hooks: LoadedHook[] = fs
  .readdirSync(hooksDir)
  .filter((f) => f.endsWith('.kiro.hook') || f.endsWith('.json'))
  .sort()
  .map((file) => {
    const raw = fs.readFileSync(path.join(hooksDir, file), 'utf-8');
    return { file, raw, prompt: extractPrompt(raw) };
  });

describe('Hook and steering synchronisation', () => {
  it('both hook formats are shipped', () => {
    expect(hooks.length).toBe(2);
    expect(hooks.map((h) => h.file)).toEqual([
      'fish-expert-guidance.json',
      'pre-fish-tool.kiro.hook',
    ]);
  });

  it('every hook file is valid JSON with a substantial prompt', () => {
    for (const hook of hooks) {
      expect(() => JSON.parse(hook.raw), `${hook.file} must be valid JSON`).not.toThrow();
      expect(hook.prompt.length, `${hook.file} prompt too short`).toBeGreaterThan(1000);
    }
  });

  it('both hooks carry an identical prompt so behaviour cannot drift between formats', () => {
    const [a, b] = hooks;
    expect(a.prompt).toBe(b.prompt);
  });

  /**
   * The core property: every steering file on disk must be routable from every
   * shipped hook. If this fails, guidance exists but will never be loaded.
   */
  it('Property: every steering file is referenced by every hook', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: hooks.length - 1 }),
        fc.integer({ min: 0, max: steering.length - 1 }),
        (hookIndex, steeringIndex) => {
          const hook = hooks[hookIndex];
          const file = steering[steeringIndex];
          expect(
            hook.prompt,
            `${hook.file} does not route to ${file}; that steering file is unreachable`
          ).toContain(file);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('every hook enforces the three non-negotiable advisory rules', () => {
    for (const hook of hooks) {
      expect(
        hook.prompt,
        `${hook.file} must require asking for the jurisdiction AND the monetisation model`
      ).toMatch(/JURISDICTION AND THE MONETISATION MODEL FIRST/i);
      expect(hook.prompt, `${hook.file} must forbid guessing regulatory values`).toMatch(
        /NEVER GUESS A NUMBER/i
      );
      expect(hook.prompt, `${hook.file} must disclaim legal advice`).toMatch(
        /DO NOT GIVE LEGAL ADVICE/i
      );
    }
  });

  it('every hook lists the confidence levels', () => {
    for (const hook of hooks) {
      for (const level of ['HIGH', 'MEDIUM', 'UNVERIFIED']) {
        expect(hook.prompt, `${hook.file} must mention ${level}`).toContain(level);
      }
    }
  });

  /**
   * These are the fish-specific red flags. A hook that omits them will let the
   * Power answer a maths question while an architecture violation goes unmentioned.
   */
  it('every hook lists the fish-specific immediate red flags', () => {
    for (const hook of hooks) {
      expect(hook.prompt, `${hook.file} must flag non-cryptographic RNG`).toMatch(
        /Math\.random|non-cryptographic/i
      );
      expect(hook.prompt, `${hook.file} must flag fish spawning as an RNG consumption point`).toMatch(
        /fish spawning/i
      );
      expect(hook.prompt, `${hook.file} must reject client-decides-server-validates`).toMatch(
        /Client decides, server validates/i
      );
      expect(hook.prompt, `${hook.file} must flag compensated payout control`).toMatch(/控分/);
      expect(hook.prompt, `${hook.file} must flag per-bet-multiplier RTP inconsistency`).toMatch(
        /砲倍 RTP inconsistency/i
      );
      expect(hook.prompt, `${hook.file} must flag self-excluded or under-age players`).toMatch(
        /Self-excluded or under-age/i
      );
    }
  });

  it('every hook carries the proactive warnings clients most often get wrong', () => {
    for (const hook of hooks) {
      // Skill element is not a pass
      expect(hook.prompt, `${hook.file} must cite Gift Surplus`).toMatch(/Gift Surplus/);
      // GB chance-influence rule
      expect(hook.prompt, `${hook.file} must state the GB chance-influence rule`).toMatch(
        /can be influenced by chance/i
      );
      // Taiwan statute specifics
      expect(hook.prompt, `${hook.file} must cite Taiwan prize caps`).toMatch(/NT\$2,000/);
      expect(hook.prompt, `${hook.file} must cite Taiwan §7 modification rule`).toMatch(/§7/);
      // Export exemption misreading
      expect(hook.prompt, `${hook.file} must warn about the 專供出口 exemption`).toMatch(
        /專供出口/
      );
      // Prohibited markets
      expect(hook.prompt, `${hook.file} must name US enforcement markets`).toMatch(
        /Florida|North Carolina|Hawaii/
      );
      // Strategy-dependent RTP
      expect(hook.prompt, `${hook.file} must state RTP is a strategy-dependent range`).toMatch(
        /strategy-dependent range/i
      );
      // Weapon denominator
      expect(hook.prompt, `${hook.file} must state the acquisition-cost denominator rule`).toMatch(
        /ACQUIRING it/i
      );
      // Same-table value transfer
      expect(hook.prompt, `${hook.file} must warn about 同桌價值轉移`).toMatch(/同桌價值轉移/);
      // Lab independence
      expect(hook.prompt, `${hook.file} must disclose GLI/iTech common ownership`).toMatch(
        /iTech Labs/
      );
      // NIST SP 800-22
      expect(hook.prompt, `${hook.file} must carry the SP 800-22 correction`).toMatch(/800-22/);
      // Loss items
      expect(hook.prompt, `${hook.file} must mention 魚離場 loss items`).toMatch(/魚離場/);
      // Betting unit
      expect(hook.prompt, `${hook.file} must declare one bullet as the betting unit`).toMatch(
        /one bullet as the betting unit/i
      );
    }
  });

  it('the v1 agent-hook file uses the documented schema', () => {
    const v1 = hooks.find((h) => h.file.endsWith('.json'))!;
    const parsed = JSON.parse(v1.raw);
    expect(parsed.version).toBe('v1');
    expect(Array.isArray(parsed.hooks)).toBe(true);
    expect(parsed.hooks).toHaveLength(1);
    expect(parsed.hooks[0].trigger).toBe('UserPromptSubmit');
    expect(parsed.hooks[0].action.type).toBe('agent');
    expect(parsed.hooks[0].name).toBeTruthy();
  });

  it('the legacy hook file uses the legacy schema', () => {
    const legacy = hooks.find((h) => h.file.endsWith('.kiro.hook'))!;
    const parsed = JSON.parse(legacy.raw);
    expect(parsed.when?.type).toBe('promptSubmit');
    expect(parsed.then?.type).toBe('askAgent');
    expect(parsed.name).toBeTruthy();
    expect(parsed.description).toBeTruthy();
  });

  it('no hook references a steering file that does not exist', () => {
    for (const hook of hooks) {
      for (const ref of hook.prompt.match(/[a-z0-9-]+\.md/g) ?? []) {
        expect(steering, `${hook.file} routes to non-existent steering file ${ref}`).toContain(ref);
      }
    }
  });
});
