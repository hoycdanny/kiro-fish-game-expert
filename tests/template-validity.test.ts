import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as path from 'path';
import { readJson, walkJson, exists } from './helpers';

/**
 * Template validity across every template category.
 *
 * Templates are the consultant's deliverables. A malformed template is discovered
 * at the worst possible moment: when a client is waiting for a deliverable.
 */

const templates = walkJson('templates').map((relPath) => ({
  relPath,
  category: path.basename(path.dirname(relPath)),
  data: readJson<Record<string, any>>(relPath),
}));

describe('Template validity', () => {
  it('there are templates to test', () => {
    expect(templates.length).toBeGreaterThan(0);
  });

  it('every template parses to an object', () => {
    for (const t of templates) {
      expect(t.data, `${t.relPath} did not parse to an object`).toBeTypeOf('object');
      expect(t.data).not.toBeNull();
    }
  });

  /**
   * Without a namespaced, versioned templateType a template cannot be identified
   * or migrated.
   */
  it('Property: every template declares a namespaced versioned templateType', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: templates.length - 1 }), (index) => {
        const t = templates[index];
        const tt = t.data.templateType as string | undefined;
        expect(tt, `${t.relPath} missing templateType`).toBeDefined();
        expect(
          tt!.startsWith('fish-game-expert/'),
          `${t.relPath} templateType must be namespaced: ${tt}`
        ).toBe(true);
        expect(
          /-v\d+$/.test(tt!),
          `${t.relPath} templateType must be versioned: ${tt}`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('all expected template categories are present', () => {
    const categories = new Set(templates.map((t) => t.category));
    for (const expected of [
      'market-profiles',
      'certification',
      'advisory',
      'species-payout',
      'capture-model',
    ]) {
      expect(categories, `missing template category: ${expected}`).toContain(expected);
    }
  });

  it('the consultant deliverable set is complete', () => {
    for (const f of [
      'templates/market-profiles/_schema.json',
      'templates/market-profiles/_prohibited-and-grey-markets.json',
      'templates/certification/par-sheet.json',
      'templates/certification/rng-submission-package.json',
      'templates/certification/skill-chance-dossier.json',
      'templates/certification/change-management-request.json',
      'templates/certification/gli-submission-checklist.json',
      'templates/advisory/compliance-gap-assessment.json',
      'templates/advisory/risk-register.json',
      'templates/advisory/market-entry-roadmap.json',
      'templates/advisory/incident-report.json',
      'templates/species-payout/ocean-hunter-8-seat-96rtp.json',
      'templates/capture-model/weighted-hp-medium-volatility.json',
    ]) {
      expect(exists(f), `missing deliverable template: ${f}`).toBe(true);
    }
  });

  /**
   * Market profiles deliberately SHARE a templateType, because they are many
   * instances of one shape. Every other template is a distinct document type and
   * must therefore have its own templateType.
   */
  it('market profiles share one templateType while other templates are distinct', () => {
    const marketProfileTypes = new Set(
      templates
        .filter(
          (t) => t.category === 'market-profiles' && !path.basename(t.relPath).startsWith('_')
        )
        .map((t) => t.data.templateType)
    );
    expect(marketProfileTypes.size, 'market profiles must share a single templateType').toBe(1);

    const otherTypes = templates
      .filter((t) => t.category !== 'market-profiles')
      .map((t) => t.data.templateType);
    expect(
      new Set(otherTypes).size,
      'non-market-profile templates must each have a distinct templateType'
    ).toBe(otherTypes.length);
  });

  it('every non-market-profile template carries a description', () => {
    for (const t of templates) {
      if (t.category === 'market-profiles' && !path.basename(t.relPath).startsWith('_')) continue;
      expect(t.data.description, `${t.relPath} missing description`).toBeTruthy();
    }
  });
});

describe('PAR sheet template completeness', () => {
  const par = readJson<Record<string, any>>('templates/certification/par-sheet.json');
  const sectionKeys = Object.keys(par).filter((k) => /^section\d+_/.test(k));

  it('contains all sixteen numbered sections with no gaps', () => {
    expect(sectionKeys.length).toBe(16);
    const numbers = sectionKeys
      .map((k) => parseInt(k.match(/^section(\d+)_/)![1], 10))
      .sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it('binds the document to a specific build and configuration', () => {
    const s1 = par.section1_gameIdentification;
    expect(s1.buildHash).toBeDefined();
    expect(s1.configHash).toBeDefined();
    expect(s1.hashDigestBits).toBeDefined();
  });

  /**
   * Without an explicit wager-unit declaration every RTP figure in the document
   * is uninterpretable, because a fish machine has no natural "game".
   */
  it('declares the wager unit explicitly, which is the section labs reject first', () => {
    const s3 = par.section3_wagerUnitDefinition;
    expect(s3.declaredUnit).toBeDefined();
    expect(JSON.stringify(s3)).toMatch(/一發子彈/);
  });

  it('requires RTP parity across every bet multiplier tier', () => {
    const s6 = par.section6_betMultiplierMatrix;
    expect(s6.perTierRtpParity).toBeDefined();
    expect(JSON.stringify(s6)).toMatch(/各砲倍 RTP 必須相同/);
  });

  it('states the acquisition-cost denominator rule for special weapons', () => {
    const s7 = par.section7_specialWeapons;
    expect(s7.rtpContributionDenominator).toBeDefined();
    expect(JSON.stringify(s7)).toMatch(/取得成本/);
  });

  it('reports the RTP breakdown under three strategies rather than a single number', () => {
    const s10 = par.section10_rtpBreakdown;
    for (const k of ['randomStrategy', 'typicalStrategy', 'optimalStrategy']) {
      expect(s10[k], `section 10 must report ${k}`).toBeDefined();
    }
  });

  it('includes the four-agent skill sensitivity analysis and the skill spread', () => {
    const s11 = par.section11_skillSensitivity;
    expect(s11.agents).toBeDefined();
    expect(s11.skillSpread).toBeDefined();
  });

  it('includes the multiplayer scenario analysis and seat expected-value dependency', () => {
    const s14 = par.section14_multiplayerScenarios;
    for (const k of [
      'singleSeat',
      'fullTable',
      'mixedSkillLevels',
      'seatExpectedValueDependency',
    ]) {
      expect(s14[k], `section 14 must report ${k}`).toBeDefined();
    }
  });

  /**
   * Loss items are unique to fish machines and are the most common reason
   * theoretical RTP comes out higher than simulated RTP.
   */
  it('includes the loss-item disclosure covering escaped fish and scene resets', () => {
    const s15 = par.section15_lossItemDisclosure;
    for (const k of ['fishEscaped', 'sceneReset', 'incompleteCaptureAtDisconnect']) {
      expect(s15[k], `section 15 must disclose ${k}`).toBeDefined();
    }
    expect(JSON.stringify(s15)).toMatch(/未回收/);
  });

  it('documents the simulation method including measured sigma and stratified sampling', () => {
    const s16 = par.section16_simulationMethod;
    for (const k of [
      'measuredSigma',
      'sampleSizeDerivation',
      'stratifiedSampling',
      'consistencyResult',
    ]) {
      expect(s16[k], `section 16 must document ${k}`).toBeDefined();
    }
  });
});

describe('RNG submission package correctness', () => {
  const pkg = readJson<Record<string, any>>(
    'templates/certification/rng-submission-package.json'
  );

  it('grounds itself in the NIST SP 800-90 series', () => {
    const nist = pkg.standardsBasis.nist;
    for (const k of ['sp800_90a', 'sp800_90b', 'sp800_90c', 'sp800_22_rev1a']) {
      expect(nist[k], `standardsBasis.nist must cover ${k}`).toBeDefined();
    }
  });

  it('carries the NIST warning that SP 800-22 is not for cryptographic RNG assessment', () => {
    expect(JSON.stringify(pkg.standardsBasis.nist.sp800_22_rev1a)).toMatch(
      /should not be used|not be used to assess|不應(被)?用於|不得用於/i
    );
  });

  it('records SP 800-90C as final in 2025-09', () => {
    expect(JSON.stringify(pkg.standardsBasis.nist.sp800_90c)).toMatch(/2025-09/);
  });

  /**
   * Fish spawning is the RNG consumption point teams most often leave on weak
   * randomness after correctly hardening the capture roll.
   */
  it('enumerates every RNG consumption point including fish spawning', () => {
    expect(pkg.consumptionPoints).toBeDefined();
    expect(JSON.stringify(pkg.consumptionPoints)).toMatch(/魚群生成|fish spawn/i);
  });

  it('names the prohibited non-cryptographic sources', () => {
    const prohibited = JSON.stringify(pkg.prohibitedSources);
    for (const src of ['Math.random', 'System.Random', 'FMath::RandRange', 'rand()']) {
      expect(prohibited, `prohibitedSources must name ${src}`).toContain(src);
    }
  });

  it('supplies independence evidence via the three behavioural tests', () => {
    const ev = pkg.independenceEvidence;
    for (const k of ['longTermDriftTest', 'injectedBiasTest', 'stateIsolationTest']) {
      expect(ev[k], `independenceEvidence must include ${k}`).toBeDefined();
    }
  });

  it('warns that GLI and iTech Labs are not independent of each other', () => {
    expect(JSON.stringify(pkg.labAccreditationNotes ?? pkg)).toMatch(/iTech Labs/);
  });
});

describe('Skill/chance dossier completeness', () => {
  const dossier = readJson<Record<string, any>>(
    'templates/certification/skill-chance-dossier.json'
  );

  it('records the applicable legal test and the enumerated skill influence points', () => {
    expect(dossier.applicableLegalTest).toBeDefined();
    expect(dossier.skillInfluencePoints).toBeDefined();
    expect(dossier.presentationSelfCheck).toBeDefined();
  });

  it('requires all six quantified metrics', () => {
    const m = dossier.quantifiedMetrics;
    for (const k of [
      'rtpRandomStrategy',
      'rtpOptimalStrategy',
      'skillSpread',
      'hitRateSpread',
      'learningCurve',
      'varianceDecomposition',
    ]) {
      expect(m[k], `quantifiedMetrics must include ${k}`).toBeDefined();
    }
  });

  it('carries interpretation thresholds rather than leaving the numbers unexplained', () => {
    expect(dossier.interpretation).toBeDefined();
    expect(JSON.stringify(dossier.interpretation)).toMatch(/100%/);
  });

  it('states that it is factual input for counsel, not a legal opinion', () => {
    expect(JSON.stringify(dossier.caveat ?? dossier)).toMatch(/法律意見/);
  });
});

describe('Change management request completeness', () => {
  const req = readJson<Record<string, any>>(
    'templates/certification/change-management-request.json'
  );

  it('classifies the change into one of five tiers', () => {
    expect(req.tierClassification).toBeDefined();
    const serialised = JSON.stringify(req.tierClassification);
    for (const tier of ['0', '1', '2', '3', '4']) {
      expect(serialised, `tierClassification must cover tier ${tier}`).toContain(tier);
    }
  });

  /**
   * Bit-exact replay comparison is the measuring instrument that turns "I think
   * this does not affect the maths" into a test result.
   */
  it('requires bit-exact replay comparison evidence', () => {
    expect(req.replayComparisonEvidence?.bitExactMatch).toBeDefined();
  });

  it('carries the Taiwan reclassification rule', () => {
    const tw = JSON.stringify(req.taiwanReclassification);
    expect(tw).toMatch(/§7/);
    expect(tw).toMatch(/視為新型機種/);
  });

  it('requires a rollback plan', () => {
    expect(req.rollbackPlan).toBeDefined();
  });
});

describe('GLI submission checklist completeness', () => {
  const cl = readJson<Record<string, any>>(
    'templates/certification/gli-submission-checklist.json'
  );

  it('drives standard selection across the relevant GLI standards', () => {
    const serialised = JSON.stringify(cl.standardSelection);
    for (const std of ['GLI-11', 'GLI-19', 'GLI-12', 'GLI-13', 'GLI-20']) {
      expect(serialised, `standardSelection must consider ${std}`).toContain(std);
    }
  });

  it('lists at least eleven submission documents each with a status field', () => {
    expect(Array.isArray(cl.documentSet)).toBe(true);
    expect(cl.documentSet.length).toBeGreaterThanOrEqual(11);
    for (const d of cl.documentSet) {
      expect(d.document, 'documentSet entry needs a document name').toBeTruthy();
      expect('status' in d, 'documentSet entry needs a status field').toBe(true);
    }
  });

  /**
   * For a fish machine the wager-unit question usually cannot be resolved from
   * the standard text at all, so the written query log is a first-class artefact.
   */
  it('includes a technical query log raising the wager-unit question', () => {
    expect(cl.technicalQueryLog).toBeDefined();
    expect(JSON.stringify(cl.technicalQueryLog)).toMatch(/一次投注/);
  });

  it('includes a rejection-risk self-check with at least eight known causes', () => {
    expect(Array.isArray(cl.rejectionRiskSelfCheck)).toBe(true);
    expect(cl.rejectionRiskSelfCheck.length).toBeGreaterThanOrEqual(8);
  });

  it('records the lab independence disclosure', () => {
    expect(JSON.stringify(cl.labSelection)).toMatch(/iTech/);
  });
});

describe('Advisory template completeness', () => {
  it('gap assessment captures the six onboarding variables and the fish-specific intake', () => {
    const gap = readJson<Record<string, any>>(
      'templates/advisory/compliance-gap-assessment.json'
    );
    for (const v of [
      'gameEngine',
      'deploymentForm',
      'monetisationModel',
      'targetMarkets',
      'tableTopology',
      'developmentStage',
    ]) {
      expect(gap.intake[v], `intake must capture ${v}`).toBeDefined();
    }
    const fishIntake = gap.fishSpecificIntake;
    const count = Array.isArray(fishIntake) ? fishIntake.length : Object.keys(fishIntake).length;
    expect(count, 'fishSpecificIntake must cover at least 7 items').toBeGreaterThanOrEqual(7);
  });

  it('gap assessment covers every knowledge domain with severity and remediability', () => {
    const gap = readJson<Record<string, any>>(
      'templates/advisory/compliance-gap-assessment.json'
    );
    expect(Array.isArray(gap.assessmentDomains)).toBe(true);
    expect(gap.assessmentDomains.length).toBeGreaterThanOrEqual(12);
    for (const d of gap.assessmentDomains) {
      expect(d.severity !== undefined, 'assessment domain needs severity').toBe(true);
      expect(d.remediable !== undefined, 'assessment domain needs remediable').toBe(true);
    }
  });

  /**
   * The register must be able to express a risk that engineering cannot fix,
   * otherwise a legal-status risk gets written down as a development task.
   */
  it('risk register can express a non-engineering-mitigable risk and does so', () => {
    const reg = readJson<Record<string, any>>('templates/advisory/risk-register.json');
    expect(reg.scoringScheme.likelihoodScale).toBeDefined();
    expect(reg.scoringScheme.impactScale).toBeDefined();
    expect(Array.isArray(reg.risks)).toBe(true);
    for (const r of reg.risks) {
      expect(typeof r.engineeringMitigable, `risk ${r.id} engineeringMitigable`).toBe('boolean');
    }
    expect(
      reg.risks.some((r: any) => r.engineeringMitigable === false),
      'register must seed at least one risk engineering cannot mitigate'
    ).toBe(true);
  });

  it('roadmap encodes the non-retrofittable architecture rule and quotes no durations', () => {
    const rm = readJson<Record<string, any>>('templates/advisory/market-entry-roadmap.json');
    expect(Array.isArray(rm.phases)).toBe(true);
    expect(rm.phases.length).toBeGreaterThanOrEqual(7);
    for (const p of rm.phases) {
      expect(Array.isArray(p.entryCriteria), `phase ${p.phase} entryCriteria`).toBe(true);
      expect(Array.isArray(p.exitCriteria), `phase ${p.phase} exitCriteria`).toBe(true);
      expect(
        p.estimatedDuration,
        `phase ${p.phase} estimatedDuration must be null; durations must be quoted, not assumed`
      ).toBeNull();
    }
    expect(JSON.stringify(rm.sequencingRules)).toMatch(/無法事後補上|不可事後補上/);
  });

  it('incident report preserves replay evidence, not just the wallet ledger', () => {
    const inc = readJson<Record<string, any>>('templates/advisory/incident-report.json');
    const manifest = JSON.stringify(inc.evidencePreservation);
    expect(manifest).toMatch(/對局重播/);
    expect(manifest).toMatch(/spawn seed/i);
  });

  it('incident report scopes departed players and does not decide clawback ad hoc', () => {
    const inc = readJson<Record<string, any>>('templates/advisory/incident-report.json');
    expect(inc.affectedScope.departedPlayersTraced).toBeDefined();
    expect(inc.remediation.clawbackConsidered).toBeDefined();
    expect(JSON.stringify(inc.remediation.clawbackConsidered)).toMatch(/UNVERIFIED/);
  });

  it('incident report separates the game-integrity and personal-data notification tracks', () => {
    const inc = readJson<Record<string, any>>('templates/advisory/incident-report.json');
    expect(inc.notification.gameIntegrityTrack).toBeDefined();
    expect(inc.notification.personalDataTrack).toBeDefined();
    expect(JSON.stringify(inc.notification.personalDataTrack)).toMatch(/72/);
  });

  it('incident report requires preventive invariants', () => {
    const inc = readJson<Record<string, any>>('templates/advisory/incident-report.json');
    expect(Array.isArray(inc.preventiveInvariants)).toBe(true);
    expect(inc.preventiveInvariants.length).toBeGreaterThan(0);
  });
});
