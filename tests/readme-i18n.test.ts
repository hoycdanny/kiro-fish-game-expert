import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { repoRoot, read, exists, steeringFiles, marketProfilePaths, EXPECTED_READMES } from './helpers';

/**
 * README internationalisation consistency.
 *
 * Multi-language READMEs drift in two predictable ways: a new language file is
 * added but the switcher in the other files is not updated, and counts stated in
 * one language fall out of step with the repository. Both are tested here, with
 * counts derived from the repository so they cannot go stale.
 */

const readmes = EXPECTED_READMES.map(({ file, label }) => ({
  file,
  label,
  content: exists(file) ? read(file) : null,
}));

const steeringCount = steeringFiles().length;
const marketProfileCount = marketProfilePaths().length;

describe('README internationalisation', () => {
  it('all five language READMEs exist', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} is missing`).not.toBeNull();
    }
  });

  /**
   * Property: every README must link to every other README. A one-way switcher
   * strands readers in a language they did not choose.
   */
  it('Property: every README links to every language version', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: readmes.length - 1 }),
        fc.integer({ min: 0, max: EXPECTED_READMES.length - 1 }),
        (sourceIndex, targetIndex) => {
          const source = readmes[sourceIndex];
          const target = EXPECTED_READMES[targetIndex];
          expect(
            source.content,
            `${source.file} must link to ${target.file} as [${target.label}]`
          ).toContain(`[${target.label}](${target.file})`);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('the language switcher sits on the second non-empty line of every README', () => {
    for (const r of readmes) {
      const lines = r.content!.split('\n').filter((l) => l.trim().length > 0);
      expect(lines[1], `${r.file} switcher placement`).toContain('](README.md)');
    }
  });

  it('no README references a language file that does not exist', () => {
    const known = new Set(EXPECTED_READMES.map((r) => r.file));
    for (const r of readmes) {
      for (const ref of r.content!.match(/README(?:_[A-Z]{2})?\.md/g) ?? []) {
        expect(known, `${r.file} references unknown README ${ref}`).toContain(ref);
      }
    }
  });

  /**
   * Counts are stated in prose across five languages. Derive them from the repo
   * so a structural change cannot silently leave four translations wrong.
   */
  it('every README states the correct steering file count', () => {
    for (const r of readmes) {
      expect(
        r.content,
        `${r.file} must state the steering count of ${steeringCount}`
      ).toMatch(
        new RegExp(
          `${steeringCount}\\s*(domain knowledge|[份個个]\\s*領域知識|[份個个]\\s*领域知识|のドメイン知識|개\\s*도메인\\s*지식)`
        )
      );
    }
  });

  it('every README states the correct market profile count', () => {
    for (const r of readmes) {
      expect(
        r.content,
        `${r.file} must state the market profile count of ${marketProfileCount}`
      ).toContain(String(marketProfileCount));
    }
  });

  it('every README carries the confidence level vocabulary', () => {
    for (const r of readmes) {
      for (const level of ['HIGH', 'MEDIUM', 'UNVERIFIED']) {
        expect(r.content, `${r.file} must document confidence level ${level}`).toContain(level);
      }
    }
  });

  it('every README warns about prohibited markets with the stop marker', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must include the prohibited market warning`).toMatch(/⛔/);
    }
  });

  /**
   * These three corrections are the reason this Power exists rather than being a
   * reformatted vendor brochure, so every language edition must carry them.
   */
  it('every README carries the Gift Surplus, export-exemption and SP 800-22 corrections', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must cite Gift Surplus`).toContain('Gift Surplus');
      expect(r.content, `${r.file} must carry the export exemption correction`).toMatch(
        /專供出口|专供出口|専ら輸出|수출 면제|solely for export|전용 수출/
      );
      expect(r.content, `${r.file} must carry the SP 800-22 correction`).toContain('800-22');
    }
  });

  it('every README discloses the GLI and iTech Labs common ownership', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must disclose the lab independence issue`).toContain(
        'iTech Labs'
      );
    }
  });

  it('every README states that one bullet is the atomic betting unit', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must define the betting unit`).toMatch(
        /one bullet|一發子彈|一发子弹|1\s*発の弾丸|1발의\s*탄환/i
      );
    }
  });

  it('every README frames the Power as a compliance advisor rather than a code generator', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must state the advisor framing`).toMatch(
        /compliance advisor|合規顧問|合规顾问|コンプライアンス・アドバイザー|컴플라이언스 어드바이저/
      );
    }
  });

  it('every README documents both hook installation formats', () => {
    for (const r of readmes) {
      expect(r.content, `${r.file} must document the v1 hook`).toContain(
        'fish-expert-guidance.json'
      );
      expect(r.content, `${r.file} must document the legacy hook`).toContain(
        'pre-fish-tool.kiro.hook'
      );
    }
  });

  it('every README documents the same five engines', () => {
    for (const r of readmes) {
      for (const engine of ['Unity', 'Cocos Creator', 'Unreal Engine', 'Godot', 'PixiJS']) {
        expect(r.content, `${r.file} must document ${engine}`).toContain(engine);
      }
    }
  });

  /**
   * The Japanese and Korean editions target jurisdictions where a cash-out fish
   * machine has no lawful route. Those readers need that stated in their own
   * language up front, not buried in an English market table.
   */
  it('the Japanese README states the Japanese cash-payout prohibition prominently', () => {
    const jp = readmes.find((r) => r.file === 'README_JP.md')!;
    const firstThird = jp.content!.slice(0, Math.floor(jp.content!.length / 3));
    expect(firstThird, 'README_JP.md must lead with the prohibition').toMatch(/⛔/);
    expect(jp.content, 'README_JP.md must state the cash payout prohibition').toMatch(
      /現金で払い出すことはできません|現金.*禁じ/
    );
    expect(jp.content, 'README_JP.md must name the applicable regime').toMatch(/賭博罪/);
    expect(jp.content, 'README_JP.md must be honest about confidence').toContain('UNVERIFIED');
  });

  it('the Korean README states the Korean prohibition prominently', () => {
    const kr = readmes.find((r) => r.file === 'README_KR.md')!;
    const firstThird = kr.content!.slice(0, Math.floor(kr.content!.length / 3));
    expect(firstThird, 'README_KR.md must lead with the prohibition').toMatch(/⛔/);
    expect(kr.content, 'README_KR.md must name 사행성').toMatch(/사행성/);
    expect(kr.content, 'README_KR.md must state the prohibition').toMatch(/불법/);
    expect(kr.content, 'README_KR.md must be honest about confidence').toContain('UNVERIFIED');
  });

  it('the Chinese simplified README addresses the mainland China position', () => {
    const cn = readmes.find((r) => r.file === 'README_CN.md')!;
    expect(cn.content, 'README_CN.md must address the mainland position').toMatch(/中国大陆/);
  });
});

describe('Repository support files', () => {
  it('ships a licence, contributing guide and code of conduct', () => {
    for (const f of ['LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md']) {
      expect(exists(f), `${f} is missing`).toBe(true);
    }
  });

  it('the contributing guide anchors the security section the READMEs link to', () => {
    const contributing = read('CONTRIBUTING.md');
    expect(contributing, 'CONTRIBUTING.md needs a Security issue notifications heading').toMatch(
      /##\s+Security issue notifications/
    );
  });

  it('the contributing guide states the never-guess-a-value rule', () => {
    const contributing = read('CONTRIBUTING.md');
    expect(contributing).toMatch(/Never contribute a regulatory value/i);
    for (const level of ['HIGH', 'MEDIUM', 'UNVERIFIED']) {
      expect(contributing, `CONTRIBUTING.md must define ${level}`).toContain(level);
    }
  });

  it('package.json declares the test and typecheck scripts and the expected dev dependencies', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.test).toBeTruthy();
    expect(pkg.scripts.typecheck).toBeTruthy();
    for (const dep of ['vitest', 'fast-check', 'typescript']) {
      expect(pkg.devDependencies[dep], `package.json must depend on ${dep}`).toBeTruthy();
    }
  });

  it('gitignore excludes the local .kiro directory so installed hooks are not committed', () => {
    expect(read('.gitignore')).toMatch(/^\.kiro\/$/m);
  });

  it('the test directory contains only test files and shared helpers', () => {
    const files = fs.readdirSync(path.join(repoRoot, 'tests'));
    for (const f of files) {
      expect(
        f.endsWith('.test.ts') || f === 'helpers.ts',
        `unexpected file in tests/: ${f}`
      ).toBe(true);
    }
  });
});
