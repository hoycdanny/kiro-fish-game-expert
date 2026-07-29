import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  readJson,
  marketProfilePaths,
  CONFIDENCE_LEVELS,
  FEATURE_STATUS_VALUES,
  LEGAL_STATUS_VALUES,
  CLASSIFICATION_TEST_VALUES,
} from './helpers';

/**
 * Market profile schema conformance.
 *
 * The advisory value of a market profile depends on every regulatory value being
 * confidence-annotated. A profile that states a number without a confidence level
 * is worse than one that states nothing, because a consultant will cite it as fact.
 */

const profiles = marketProfilePaths().map((relPath) => ({
  relPath,
  data: readJson<Record<string, any>>(relPath),
}));

const REQUIRED_TOP_LEVEL = [
  'templateType',
  'marketCode',
  'name',
  'legalStatus',
  'regulator',
  'classificationTest',
  'monetisation',
  'productConstraints',
  'rtp',
  'playerAccount',
  'auditLog',
  'dataResidency',
  'certification',
  'verificationRequired',
  'lastUpdated',
];

const REQUIRED_MONETISATION = [
  'cashOut',
  'prizeRedemption',
  'maxPrizeValue',
  'prizeBuyback',
  'realCurrencyAtMachine',
  'paymentCardAtMachine',
  'tokenSpecConstraint',
  'sweepstakesModel',
];

const REQUIRED_CONSTRAINTS = [
  'minGameCycleMs',
  'maxStakePerBullet',
  'maxBetMultiplier',
  'maxWinPerCapture',
  'autoFire',
  'crossTablePool',
  'multiSeatSharedPool',
  'featureBuy',
  'celebrationOfNonWin',
  'otherProhibitions',
];

const REQUIRED_RTP = [
  'minimum',
  'wagerUnitBasis',
  'nonCashPrizeValuation',
  'perTierParityRequired',
];

describe('Market profile schema conformance', () => {
  it('there is a meaningful number of market profiles', () => {
    expect(profiles.length).toBeGreaterThanOrEqual(20);
  });

  it('every profile declares the shared market-profile templateType', () => {
    for (const { relPath, data } of profiles) {
      expect(data.templateType, `${relPath} templateType`).toBe(
        'fish-game-expert/market-profile-v1'
      );
    }
  });

  it('every profile has all required top-level fields', () => {
    for (const { relPath, data } of profiles) {
      for (const field of REQUIRED_TOP_LEVEL) {
        expect(data[field], `${relPath} missing ${field}`).toBeDefined();
      }
    }
  });

  it('marketCode values are unique across profiles', () => {
    const codes = profiles.map((p) => p.data.marketCode);
    expect(new Set(codes).size, `duplicate marketCode in ${codes.join(', ')}`).toBe(codes.length);
  });

  it('every legalStatus is a recognised value', () => {
    for (const { relPath, data } of profiles) {
      expect(LEGAL_STATUS_VALUES, `${relPath} legalStatus=${data.legalStatus}`).toContain(
        data.legalStatus
      );
    }
  });

  /**
   * Fish machines differ from slots in that classification comes first, so the
   * applicable legal test is a required, closed-vocabulary field.
   */
  it('every profile declares an applicable classification test with a confidence level', () => {
    for (const { relPath, data } of profiles) {
      const ct = data.classificationTest;
      expect(CLASSIFICATION_TEST_VALUES, `${relPath} classificationTest.value`).toContain(ct.value);
      expect(CONFIDENCE_LEVELS, `${relPath} classificationTest.confidence`).toContain(ct.confidence);
    }
  });

  it('every regulator entry has a name and an absolute URL', () => {
    for (const { relPath, data } of profiles) {
      expect(data.regulator.name, `${relPath} regulator.name`).toBeTruthy();
      expect(
        () => new URL(data.regulator.url),
        `${relPath} regulator.url must be a valid URL`
      ).not.toThrow();
    }
  });

  it('every profile carries the full monetisation, constraint and rtp key sets', () => {
    for (const { relPath, data } of profiles) {
      for (const k of REQUIRED_MONETISATION) {
        expect(data.monetisation[k], `${relPath} monetisation.${k}`).toBeDefined();
      }
      for (const k of REQUIRED_CONSTRAINTS) {
        expect(data.productConstraints[k], `${relPath} productConstraints.${k}`).toBeDefined();
      }
      for (const k of REQUIRED_RTP) {
        expect(data.rtp[k], `${relPath} rtp.${k}`).toBeDefined();
      }
    }
  });

  /**
   * Property: every monetisation and product-constraint entry must carry a valid
   * confidence level, and any entry expressed as a feature status must use the
   * closed vocabulary.
   */
  it('Property: monetisation and product constraints always carry valid confidence and status', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: profiles.length - 1 }), (index) => {
        const { relPath, data } = profiles[index];

        for (const [section, entries] of [
          ['monetisation', data.monetisation],
          ['productConstraints', data.productConstraints],
        ] as const) {
          for (const [key, value] of Object.entries(entries as Record<string, any>)) {
            if (key === 'otherProhibitions') {
              expect(Array.isArray(value), `${relPath} otherProhibitions must be an array`).toBe(
                true
              );
              for (const item of value) {
                expect(item.item, `${relPath} otherProhibitions item text`).toBeTruthy();
                expect(
                  CONFIDENCE_LEVELS,
                  `${relPath} otherProhibitions confidence`
                ).toContain(item.confidence);
              }
              continue;
            }

            expect(value, `${relPath} ${section}.${key} must be an object`).toBeTypeOf('object');
            expect(CONFIDENCE_LEVELS, `${relPath} ${section}.${key} confidence`).toContain(
              value.confidence
            );
            if ('status' in value) {
              expect(FEATURE_STATUS_VALUES, `${relPath} ${section}.${key} status`).toContain(
                value.status
              );
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * The core honesty property. An UNVERIFIED entry must not carry a concrete
   * value or status, because that is exactly how a guess becomes a product spec.
   */
  it('Property: UNVERIFIED entries never assert a concrete value', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: profiles.length - 1 }), (index) => {
        const { relPath, data } = profiles[index];

        const sections: Array<[string, Record<string, any>]> = [
          ['monetisation', data.monetisation],
          ['productConstraints', data.productConstraints],
          ['rtp', data.rtp],
          ['playerAccount', data.playerAccount],
          ['auditLog', data.auditLog],
          ['dataResidency', data.dataResidency],
          ['certification', data.certification],
        ];

        for (const [section, entries] of sections) {
          for (const [key, value] of Object.entries(entries)) {
            if (key === 'otherProhibitions') continue;
            if (value?.confidence !== 'UNVERIFIED') continue;

            if ('value' in value) {
              expect(
                value.value,
                `${relPath} ${section}.${key} is UNVERIFIED so value must be null`
              ).toBeNull();
            }
            if ('status' in value) {
              expect(
                value.status,
                `${relPath} ${section}.${key} is UNVERIFIED so status must be "unverified"`
              ).toBe('unverified');
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property: rtp.minimum is confidence-annotated and never a bare number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: profiles.length - 1 }), (index) => {
        const { relPath, data } = profiles[index];
        const min = data.rtp.minimum;
        expect(CONFIDENCE_LEVELS, `${relPath} rtp.minimum.confidence`).toContain(min.confidence);
        if (min.confidence === 'UNVERIFIED') {
          expect(min.value, `${relPath} UNVERIFIED rtp must be null`).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('any profile containing UNVERIFIED values has a non-empty verificationRequired list', () => {
    for (const { relPath, data } of profiles) {
      if (!JSON.stringify(data).includes('UNVERIFIED')) continue;
      expect(
        Array.isArray(data.verificationRequired),
        `${relPath} verificationRequired must be an array`
      ).toBe(true);
      expect(
        data.verificationRequired.length,
        `${relPath} has UNVERIFIED values so verificationRequired must not be empty`
      ).toBeGreaterThan(0);
      for (const item of data.verificationRequired) {
        expect(typeof item, `${relPath} verificationRequired entries must be strings`).toBe(
          'string'
        );
      }
    }
  });

  it('every profile records a lastUpdated date in ISO form', () => {
    for (const { relPath, data } of profiles) {
      expect(data.lastUpdated, `${relPath} lastUpdated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('Taiwan profile depth', () => {
  /**
   * Taiwan is the manufacturing and export hub for this product category and the
   * only market whose cash-out and payment constraints sit in statute. If this
   * profile degrades to UNVERIFIED, the Power loses its most citable content.
   */
  const tw = readJson<Record<string, any>>('templates/market-profiles/taiwan-moea.json');

  it('records the statutory prize value caps at HIGH confidence', () => {
    expect(tw.monetisation.maxPrizeValue.confidence).toBe('HIGH');
    expect(JSON.stringify(tw.monetisation.maxPrizeValue.value)).toMatch(/2,000/);
    expect(JSON.stringify(tw.monetisation.maxPrizeValue.value)).toMatch(/1,000/);
  });

  it('records the cash-prize and prize-buyback prohibitions at HIGH confidence', () => {
    expect(tw.monetisation.cashOut.status).toBe('prohibited');
    expect(tw.monetisation.cashOut.confidence).toBe('HIGH');
    expect(tw.monetisation.prizeBuyback.status).toBe('prohibited');
    expect(tw.monetisation.prizeBuyback.confidence).toBe('HIGH');
  });

  it('records the cabinet payment-instrument prohibition at HIGH confidence', () => {
    expect(tw.monetisation.realCurrencyAtMachine.status).toBe('prohibited');
    expect(tw.monetisation.realCurrencyAtMachine.confidence).toBe('HIGH');
    expect(tw.monetisation.paymentCardAtMachine.status).toBe('prohibited');
    expect(tw.monetisation.paymentCardAtMachine.confidence).toBe('HIGH');
  });

  it('uses the administrative classification route rather than a judicial test', () => {
    expect(tw.classificationTest.value).toBe('administrative-classification');
    expect(tw.classificationTest.confidence).toBe('HIGH');
  });

  it('records the two-track certification scheme and the 30-day decision window', () => {
    expect(tw.certification.scheme.confidence).toBe('HIGH');
    expect(tw.certification.scheme.value).toMatch(/評鑑分類/);
    expect(tw.certification.scheme.value).toMatch(/商品檢驗/);
    expect(tw.certification.decisionWindow.value).toMatch(/30/);
    expect(tw.certification.decisionWindow.confidence).toBe('HIGH');
  });

  /**
   * The export exemption is the single most commonly misread provision in this
   * industry, so the profile must state explicitly that it says nothing about
   * destination legality.
   */
  it('records the export exemption together with the warning that it is not destination legality', () => {
    const exemption = tw.certification.exportExemption;
    expect(exemption.confidence).toBe('HIGH');
    expect(exemption.value).toMatch(/專供出口/);
    expect(exemption.notes).toMatch(/目的地/);
  });

  it('records the "software modification is a new machine type" rule', () => {
    const items = tw.productConstraints.otherProhibitions.map((o: any) => o.item).join(' ');
    expect(items).toMatch(/視為新型機種/);
  });
});

describe('Prohibited and grey market register', () => {
  const register = readJson<Record<string, any>>(
    'templates/market-profiles/_prohibited-and-grey-markets.json'
  );

  it('declares its own templateType', () => {
    expect(register.templateType).toBe('fish-game-expert/prohibited-grey-market-register-v1');
  });

  /**
   * This is the register's whole purpose: to stop the Power from applying a
   * "how do we comply" frame to a market with no lawful route at all.
   */
  it('states the advisory principle that technical compliance cannot fix legal status', () => {
    expect(register.advisoryPrinciple).toMatch(/CANNOT resolve a legal status/);
  });

  it('covers the markets where fish tables are unlawful or named enforcement targets', () => {
    const codes = (register.markets as any[]).map((m) => m.marketCode);
    for (const expected of ['FL', 'NC', 'HI', 'TX', 'CN', 'KR', 'JP']) {
      expect(codes, `register must cover ${expected}`).toContain(expected);
    }
  });

  it('every register entry states a legal basis, a legal status and a confidence level', () => {
    for (const market of register.markets as any[]) {
      expect(market.name, `${market.marketCode} name`).toBeTruthy();
      expect(market.basis, `${market.marketCode} basis`).toBeTruthy();
      expect(CONFIDENCE_LEVELS, `${market.marketCode} confidence`).toContain(market.confidence);
      expect(LEGAL_STATUS_VALUES, `${market.marketCode} legalStatus`).toContain(market.legalStatus);
    }
  });

  it('every market in the register has a corresponding detailed profile where one is claimed', () => {
    const profileCodes = profiles.map((p) => p.data.marketCode);
    for (const market of register.markets as any[]) {
      if (!market.notes || !/詳見/.test(market.notes)) continue;
      expect(
        profileCodes,
        `register points at a detailed profile for ${market.marketCode} but none exists`
      ).toContain(market.marketCode);
    }
  });

  it('cites Gift Surplus for North Carolina at HIGH confidence', () => {
    const nc = (register.markets as any[]).find((m) => m.marketCode === 'NC');
    expect(nc.confidence).toBe('HIGH');
    expect(nc.basis).toMatch(/Gift Surplus/);
  });
});
