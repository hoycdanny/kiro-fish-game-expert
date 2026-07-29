import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { read, steeringFiles } from './helpers';

/**
 * Reference entry validity.
 *
 * A compliance advisor is only as good as its citations. Two failure modes are
 * tested: a malformed or unusable URL, and a citation to a source type the
 * project has ruled out (blogs, vendor marketing, affiliate reviews), which
 * would let unverifiable claims in through the back door.
 */

interface ReferenceEntry {
  index: number;
  title: string;
  url: string;
  description: string;
  verified: boolean;
}

function parseReferences(content: string): ReferenceEntry[] {
  const section = content.match(/## 參考資料（References）\s*\n([\s\S]*?)$/);
  if (!section) return [];

  const entries: ReferenceEntry[] = [];
  const lines = section[1].split('\n');

  let currentTitle = '';
  let currentIndex = 0;
  for (const line of lines) {
    const numbered = line.match(/^\s*(\d+)\.\s+\*\*(.+?)\*\*/);
    if (numbered) {
      currentIndex = parseInt(numbered[1], 10);
      currentTitle = numbered[2].trim();
      continue;
    }
    const urlMatch = line.match(/^\s+-\s+URL:\s*(.+)$/);
    if (urlMatch && currentTitle) {
      entries.push({
        index: currentIndex,
        title: currentTitle,
        url: urlMatch[1].trim(),
        description: '',
        verified: false,
      });
      continue;
    }
    const descMatch = line.match(/^\s+-\s+說明:\s*(.+)$/);
    if (descMatch && entries.length > 0) {
      entries[entries.length - 1].description = descMatch[1].trim();
      continue;
    }
    if (/驗證狀態/.test(line) && entries.length > 0) {
      entries[entries.length - 1].verified = line.includes('✅');
    }
  }

  return entries;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const powerMd = read('POWER.md');
const references = parseReferences(powerMd);

/** Host substrings that must never appear as an authority in this project. */
const DISALLOWED_HOST_FRAGMENTS = [
  'blogspot',
  'medium.com',
  'wordpress.com',
  'casino',
  'slotegrator',
  'affiliate',
  'reddit.com',
  'wikipedia.org',
  'fandom.com',
];

describe('POWER.md reference section', () => {
  it('contains a substantial number of references', () => {
    expect(references.length).toBeGreaterThanOrEqual(30);
  });

  it('reference numbering is contiguous starting at 1', () => {
    const indices = references.map((r) => r.index);
    expect(indices[0]).toBe(1);
    expect(new Set(indices).size).toBe(indices.length);
    expect(Math.max(...indices)).toBe(indices.length);
  });

  it('Property: every reference has a title, a description and a valid absolute URL', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: references.length - 1 }), (index) => {
        const entry = references[index];
        expect(entry.title.length, `reference ${entry.index} title`).toBeGreaterThan(3);
        expect(entry.description.length, `reference ${entry.index} description`).toBeGreaterThan(10);
        expect(isValidUrl(entry.url), `reference ${entry.index} URL: ${entry.url}`).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('Property: every reference carries a verification status marker', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: references.length - 1 }), (index) => {
        const entry = references[index];
        expect(entry.verified, `reference ${entry.index} must record verification`).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('every reference URL is unique', () => {
    const urls = references.map((r) => r.url);
    expect(new Set(urls).size, 'duplicate reference URLs').toBe(urls.length);
  });

  /**
   * The project's contribution rules forbid blogs, vendor marketing and affiliate
   * content as an authority. This test enforces that at the reference list level.
   */
  it('Property: no reference cites a disallowed source type', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: references.length - 1 }), (index) => {
        const host = new URL(references[index].url).hostname.toLowerCase();
        for (const fragment of DISALLOWED_HOST_FRAGMENTS) {
          expect(
            host.includes(fragment),
            `reference ${references[index].index} cites a disallowed source: ${host}`
          ).toBe(false);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('the reference set covers the domains this Power claims to advise on', () => {
    const allUrls = references.map((r) => r.url).join('\n');
    const requiredSources: Array<[string, string]> = [
      ['Taiwan arcade statute', 'law.moj.gov.tw'],
      ['UK Gambling Commission', 'gamblingcommission.gov.uk'],
      ['UK legislation', 'legislation.gov.uk'],
      ['North Carolina courts', 'nccourts.gov'],
      ['Hawaii legislature', 'capitol.hawaii.gov'],
      ['GLI standards', 'gaminglabs.com'],
      ['NIST', 'csrc.nist.gov'],
      ['W3C', 'w3.org'],
      ['US eCFR', 'ecfr.gov'],
      ['Nevada regulator', 'gaming.nv.gov'],
    ];
    for (const [label, host] of requiredSources) {
      expect(allUrls, `references must include ${label} (${host})`).toContain(host);
    }
  });

  it('the classification sources a fish-game advisor cannot work without are present', () => {
    const allUrls = references.map((r) => r.url).join('\n');
    expect(allUrls, 'must cite the UKGC skill-with-prizes guidance').toContain(
      'skill-with-prizes'
    );
    expect(allUrls, 'must cite Gift Surplus').toContain('gift-surplus');
  });

  it('the NIST SP 800-22 correction is carried as a reference, not just as prose', () => {
    const sp22 = references.find((r) => r.url.includes('decision-to-revise-nist-sp-800-22'));
    expect(sp22, 'the SP 800-22 revision decision must be a cited reference').toBeDefined();
    expect(sp22!.description).toMatch(/密碼學隨機數|拒絕/);
  });

  it('the GLI and iTech Labs common ownership disclosure is carried as a reference', () => {
    const disclosure = references.find((r) => r.url.includes('invests-in-itech-labs'));
    expect(disclosure, 'the lab independence disclosure must be a cited reference').toBeDefined();
  });
});

describe('Steering file citations', () => {
  const steering = steeringFiles();

  it('Property: every URL cited in a steering file is a valid absolute URL', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: steering.length - 1 }), (index) => {
        const file = steering[index];
        const content = read(`steering/${file}`);
        for (const raw of content.match(/https?:\/\/[^\s)）,，、"'`]+/g) ?? []) {
          const url = raw.replace(/[.。]+$/, '');
          expect(isValidUrl(url), `${file} has an invalid URL: ${url}`).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('no steering file cites a disallowed source type', () => {
    for (const file of steering) {
      const content = read(`steering/${file}`);
      for (const raw of content.match(/https?:\/\/[^\s)）,，、"'`]+/g) ?? []) {
        const url = raw.replace(/[.。]+$/, '');
        const host = new URL(url).hostname.toLowerCase();
        for (const fragment of DISALLOWED_HOST_FRAGMENTS) {
          expect(
            host.includes(fragment),
            `${file} cites a disallowed source: ${host}`
          ).toBe(false);
        }
      }
    }
  });

  /**
   * Every URL used anywhere in the steering set should also appear in the POWER.md
   * reference list, so that the Power has a single auditable bibliography.
   */
  it('every host cited in a steering file also appears in the POWER.md reference list', () => {
    const referenceHosts = new Set(references.map((r) => new URL(r.url).hostname.toLowerCase()));
    for (const file of steering) {
      const content = read(`steering/${file}`);
      for (const raw of content.match(/https?:\/\/[^\s)）,，、"'`]+/g) ?? []) {
        const url = raw.replace(/[.。]+$/, '');
        const host = new URL(url).hostname.toLowerCase();
        expect(
          referenceHosts.has(host),
          `${file} cites ${host}, which is missing from the POWER.md reference list`
        ).toBe(true);
      }
    }
  });
});
