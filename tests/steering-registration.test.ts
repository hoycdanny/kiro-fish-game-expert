import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as path from 'path';
import { read, exists, steeringFiles } from './helpers';

/**
 * Steering registration consistency.
 *
 * A steering file that exists on disk but is not registered in POWER.md is dead
 * weight: Kiro will never load it. A registration that points at a missing file
 * is a broken Power. Both failures are silent, so they are tested here.
 */

const powerMd = read('POWER.md');
const onDisk = steeringFiles();

interface Registration {
  heading: string;
  file: string;
  trigger?: string;
  description?: string;
}

function parseRegistrations(): Registration[] {
  const section = powerMd.match(/## Steering\s*\n([\s\S]*?)(?=\n## )/);
  if (!section) return [];

  return section[1]
    .split(/\n(?=### )/)
    .filter((b) => b.trim().startsWith('###'))
    .map((block) => ({
      heading: (block.match(/^###\s+(.+)$/m) ?? [, ''])[1].trim(),
      file: (block.match(/^-\s+file:\s*(.+)$/m) ?? [, ''])[1].trim(),
      trigger: (block.match(/^-\s+trigger:\s*(.+)$/m) ?? [, undefined])[1]?.trim(),
      description: (block.match(/^-\s+description:\s*(.+)$/m) ?? [, undefined])[1]?.trim(),
    }));
}

const registrations = parseRegistrations();

describe('Steering registration consistency', () => {
  it('POWER.md declares at least one steering directive', () => {
    expect(registrations.length).toBeGreaterThan(0);
  });

  it('every registered steering file exists on disk', () => {
    for (const reg of registrations) {
      expect(exists(reg.file), `registered but missing: ${reg.file}`).toBe(true);
    }
  });

  it('every steering file on disk is registered in POWER.md', () => {
    const registered = registrations.map((r) => path.basename(r.file));
    for (const file of onDisk) {
      expect(registered, `on disk but not registered: ${file}`).toContain(file);
    }
  });

  it('no steering file is registered twice', () => {
    const files = registrations.map((r) => r.file);
    expect(new Set(files).size).toBe(files.length);
  });

  it('the registration heading matches the referenced filename', () => {
    for (const reg of registrations) {
      expect(reg.heading, `heading/file mismatch for ${reg.file}`).toBe(path.basename(reg.file));
    }
  });

  /**
   * A registration without a substantive trigger will not fire reliably, which
   * makes the guidance effectively unreachable even though it is registered.
   */
  it('Property: every registration has a substantive trigger and description', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: registrations.length - 1 }), (index) => {
        const reg = registrations[index];
        expect(reg.file.startsWith('steering/'), `${reg.heading} file path`).toBe(true);
        expect(reg.trigger, `${reg.heading} trigger missing`).toBeDefined();
        expect(reg.trigger!.length, `${reg.heading} trigger too short`).toBeGreaterThan(20);
        expect(reg.description, `${reg.heading} description missing`).toBeDefined();
        expect(reg.description!.length, `${reg.heading} description too short`).toBeGreaterThan(10);
      }),
      { numRuns: 100 }
    );
  });

  it('the fish-specific knowledge areas are all present', () => {
    for (const required of [
      'skill-chance-classification.md',
      'payout-control-integrity.md',
      'multiplayer-fairness.md',
      'rng-capture-determination.md',
      'cabinet-hardware-compliance.md',
    ]) {
      expect(onDisk, `fish-specific steering file missing: ${required}`).toContain(required);
    }
  });
});

describe('Steering file content baseline', () => {
  it('every steering file is non-trivial and has exactly one level-1 heading', () => {
    for (const file of onDisk) {
      const content = read(`steering/${file}`);
      expect(content.length, `${file} is suspiciously short`).toBeGreaterThan(500);
      const h1 = content.match(/^#\s+.+$/gm) ?? [];
      expect(h1.length, `${file} must have exactly one level-1 heading`).toBe(1);
      expect(content.startsWith('# '), `${file} must open with its level-1 heading`).toBe(true);
    }
  });

  /**
   * The closing section is what makes this Power proactive rather than merely
   * responsive: it is the list of things to say even when unasked.
   */
  it('every steering file ends with a proactive-disclosure section', () => {
    for (const file of onDisk) {
      const content = read(`steering/${file}`);
      expect(content, `${file} needs a 需要主動說出的事 section`).toMatch(
        /^##\s+(\d+\.\s+)?需要主動說出的事\s*$/m
      );
    }
  });

  /**
   * The steering set splits into two kinds of file. Engineering and doctrine files
   * (maths, RNG, fairness, payout control, classification method) assert design
   * rules and cite instruments directly. Market and process files assert
   * regulatory values, and those must never appear without a confidence level —
   * that is the whole honesty mechanism of this Power.
   */
  const MUST_CARRY_CONFIDENCE = [
    'jurisdiction-matrix.md',
    'advisory-engagement.md',
    'platform-systems-compliance.md',
    'cabinet-hardware-compliance.md',
    'certification-prep.md',
    'responsible-gaming.md',
    'change-management-recert.md',
    'incident-malfunction-handling.md',
    'aml-kyc-player-account.md',
    'data-protection-privacy.md',
  ];

  it('every regulatory-value steering file uses the confidence vocabulary', () => {
    for (const file of MUST_CARRY_CONFIDENCE) {
      expect(onDisk, `${file} must exist`).toContain(file);
      const content = read(`steering/${file}`);
      expect(content, `${file} must annotate regulatory values with a confidence level`).toMatch(
        /UNVERIFIED/
      );
      expect(content, `${file} must use the full confidence vocabulary`).toMatch(/HIGH/);
    }
  });

  it('the jurisdiction matrix defines the confidence vocabulary it uses', () => {
    const matrix = read('steering/jurisdiction-matrix.md');
    for (const level of ['HIGH', 'MEDIUM', 'UNVERIFIED']) {
      expect(matrix, `jurisdiction-matrix.md must define ${level}`).toContain(level);
    }
    expect(matrix, 'must state that absence of a published rule is not proof of no rule').toMatch(
      /不等於沒有規定/
    );
  });
});

describe('Cross-reference integrity', () => {
  it('every steering/*.md referenced from another steering file exists', () => {
    for (const file of onDisk) {
      const content = read(`steering/${file}`);
      for (const raw of content.match(/`([a-z0-9-]+\.md)`/g) ?? []) {
        const name = raw.replace(/`/g, '');
        expect(onDisk, `${file} references missing steering file ${name}`).toContain(name);
      }
    }
  });

  it('every templates/ path referenced from a steering file exists', () => {
    for (const file of onDisk) {
      const content = read(`steering/${file}`);
      for (const ref of content.match(/templates\/[a-z0-9-]+\/[a-z0-9-]+\.json/g) ?? []) {
        expect(exists(ref), `${file} references missing template ${ref}`).toBe(true);
      }
    }
  });

  it('every steering/ path referenced from a steering file or POWER.md exists', () => {
    const sources = ['POWER.md', ...onDisk.map((f) => `steering/${f}`)];
    for (const src of sources) {
      const content = read(src);
      for (const ref of content.match(/steering\/[a-z0-9-]+\.md/g) ?? []) {
        expect(exists(ref), `${src} references missing steering file ${ref}`).toBe(true);
      }
    }
  });
});
