import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { read } from './helpers';

/**
 * POWER.md is the entry point Kiro reads to discover this Power. If its
 * frontmatter is malformed or it declares no steering directives, the Power
 * silently does nothing useful, so the structure is asserted here.
 */

const powerMd = read('POWER.md');

interface ParsedPower {
  name?: string;
  displayName?: string;
  description?: string;
  keywords: string[];
  steeringDirectives: string[];
  onboardingVariables: string[];
}

function parsePowerMd(content: string): ParsedPower | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);

  const keywords: string[] = [];
  const keywordsBlock = frontmatter.match(/^keywords:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (keywordsBlock) {
    for (const line of keywordsBlock[1].match(/^\s+-\s+(.+)$/gm) ?? []) {
      const kw = line.match(/^\s+-\s+(.+)$/);
      if (kw) keywords.push(kw[1].trim());
    }
  }

  const steeringSection = body.match(/## Steering\s*\n([\s\S]*?)(?=\n## |$)/);
  const steeringDirectives: string[] = [];
  if (steeringSection) {
    for (const m of steeringSection[1].match(/- file:\s*(.+)/g) ?? []) {
      const f = m.match(/- file:\s*(.+)/);
      if (f) steeringDirectives.push(f[1].trim());
    }
  }

  const onboardingSection = body.match(/## Onboarding\s*\n([\s\S]*?)(?=\n## )/);
  const onboardingVariables: string[] = [];
  if (onboardingSection) {
    for (const m of onboardingSection[1].match(/- variable:\s*(.+)/g) ?? []) {
      const v = m.match(/- variable:\s*(.+)/);
      if (v) onboardingVariables.push(v[1].trim());
    }
  }

  return {
    name: frontmatter.match(/^name:\s*(.+)$/m)?.[1].trim(),
    displayName: frontmatter.match(/^displayName:\s*(.+)$/m)?.[1].trim(),
    description: frontmatter.match(/^description:\s*(.+)$/m)?.[1].trim(),
    keywords,
    steeringDirectives,
    onboardingVariables,
  };
}

const parsed = parsePowerMd(powerMd);

describe('POWER.md structure', () => {
  it('parses and declares all required frontmatter fields', () => {
    expect(parsed).not.toBeNull();
    for (const field of ['name', 'displayName', 'description'] as const) {
      expect(parsed![field], `frontmatter ${field}`).toBeTruthy();
    }
    expect(parsed!.keywords.length).toBeGreaterThan(0);
  });

  it('declares the fish-game Power identity, not a slot Power', () => {
    expect(parsed!.name).toBe('fish-game-expert');
    expect(parsed!.displayName).toContain('魚機');
    expect(powerMd).not.toMatch(/slot-machine-expert/);
  });

  it('keywords cover the domain in both English and Chinese', () => {
    const kw = parsed!.keywords.map((k) => k.toLowerCase());
    for (const expected of ['fish game', 'fish table', '魚機', '捕魚機']) {
      expect(kw, `keywords must include ${expected}`).toContain(expected.toLowerCase());
    }
  });

  /**
   * The monetisation model is what changes a fish machine's legal
   * classification, so it must be an onboarding variable. Without it the Power
   * cannot ask the question it exists to ask.
   */
  it('onboarding captures engine, deployment form, monetisation model, market, topology and stage', () => {
    for (const v of [
      'gameEngine',
      'deploymentForm',
      'monetisationModel',
      'targetMarket',
      'tableTopology',
      'developmentStage',
    ]) {
      expect(parsed!.onboardingVariables, `onboarding must capture ${v}`).toContain(v);
    }
  });

  it('declares at least one steering directive, all under steering/', () => {
    expect(parsed!.steeringDirectives.length).toBeGreaterThanOrEqual(1);
    for (const d of parsed!.steeringDirectives) {
      expect(d.startsWith('steering/'), `directive path: ${d}`).toBe(true);
    }
  });

  it('Property: repeated parses of POWER.md are stable', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const again = parsePowerMd(powerMd);
        expect(again).toEqual(parsed);
      }),
      { numRuns: 25 }
    );
  });

  it('documents the fish-vs-slot domain difference so the Power is not used as a slot Power', () => {
    expect(powerMd).toMatch(/魚機與老虎機/);
  });

  it('declares an engine-to-language mapping table', () => {
    for (const engine of ['Unity', 'Cocos Creator', 'Unreal Engine', 'Godot', 'PixiJS']) {
      expect(powerMd, `tech stack table must cover ${engine}`).toContain(engine);
    }
  });
});
