# Fish Game Expert — Kiro Power

[English](README.md) | [繁體中文](README_ZH.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> Note on language availability: README files are available in 5 languages. Steering files
> (domain knowledge) are written in Traditional Chinese, deliberately retaining
> English and original-language legal and technical terms — clause references such as
> `電子遊戲場業管理條例 §14`, `Gambling Act 2005 §6`, `N.C. Gen. Stat. §14-306.4` and
> `GLI-11 v3.0` are kept verbatim because you need those exact strings to retrieve the
> source instrument and to talk to a test laboratory. The Power responds in your language
> regardless of the steering file language. If you hit a language barrier, please open an issue.

Transform your IDE into a fish machine (魚機 / fish shooting game / fish table) development expert consultant. This Power provides AI-assisted guidance on legal classification, capture-determination RNG, multiplayer fairness, payout-control integrity, certification and responsible gaming — covering the full lifecycle from concept to submission.

> Key Concepts:
>
> • **One bullet is the atomic betting unit.** A capture may consume dozens of bullets, so almost every regulatory rule written for "one game" needs an explicit mapping before it can be applied
> • **Skill vs chance classification** decides whether the device is a licensed gaming machine, a lawful amusement device, or an illegal device subject to seizure — and the answer differs by market
> • **Compensated payout control** (控分 / 場控 / 保底 / 記血) is the single most common submission failure. It is an architecture violation, not a parameter to tune
> • **Shared fish pool** means one seat's expected value depends on who else is at the table, which has no equivalent in slot machines
> • **Fish-game RTP is a strategy-dependent range**, not a single number

## What this Power is

This is a **compliance advisor**, not a code generator. When you ask for a feature, it first tells you whether that feature is lawful in your target markets, then shows you a compliant way to build it.

That distinction shapes every answer:

| | Accelerator | This Power (Expert) |
|---|---|---|
| Asked for a feature | Implements it | Asks whether it is lawful in your market first |
| Asked for a number | Gives a usable value | Gives the value **plus a confidence level, the legal source, and how to verify it** |
| Success looks like | It works | You know what risk you are carrying |

Every regulatory value carries a confidence level: `HIGH` (read from the official instrument), `MEDIUM` (authoritative secondary source), or `UNVERIFIED` (**not confirmed — never guessed**). A compliance advisor that invents a number is worse than one that leaves a blank, because a blank triggers verification while a wrong number goes straight into a product spec.

Fish machines carry more `UNVERIFIED` values than slots, and that is a property of the domain rather than a gap in research effort: most technical standards were written for single-player devices and simply do not address shared-pool multiplayer.

## Why this is not a slot Power

| Aspect | Slot machine | Fish machine |
|---|---|---|
| Player input | One trigger (press Spin) | Continuous: aim angle, fire timing, bet multiplier, target selection, weapon use |
| Outcome unit | One spin | One bullet; a single capture may take dozens |
| Legal classification | Unambiguously a game of chance | Depends on the market: gaming machine, skill game, amusement device, or illegal device |
| Participants | One player | 4–10 seats sharing one fish pool, each affecting the others |
| State space | Reel stop combinations, fully enumerable | Fish position, velocity, remaining HP, weapon state — must be simulated, not enumerated |
| Common red line | Client-side outcomes, non-cryptographic RNG | Compensated payout control, client-side capture, unauditable damage attribution |
| RTP parity | Equal across stake levels | Equal across **bet multipliers**, and holding at every skill level |
| Cash-out | Cash | Cash / ticket / prize / virtual currency, with very different classification consequences |

## Features

- 🧭 **Skill vs Chance Classification** — The three US legal tests (predominant factor, material element, any-chance), Great Britain's much broader "result can be influenced by chance" rule, Taiwan's administrative evaluation route, quantified skill-contribution evidence, and a classification dossier
- 🌍 **Jurisdiction Matrix** — Per-market legal status and technical constraints across 23 markets, each with legal citation and confidence level
- ⛔ **Prohibited market register** — Explicitly warns where fish tables are unlawful or are named enforcement targets (Florida, North Carolina, Hawaii, China, South Korea, Japan) instead of implying certification can make entry possible
- 🎯 **Math Model** — Species payout tables, HP and capture probability models, bet multiplier matrix with per-tier RTP parity, special weapon and BOSS RTP contribution, volatility tuning
- 🔬 **Math Verification** — Three verification layers including skill-level sensitivity analysis with four agents, Monte Carlo sample size derived from measured sigma, stratified sampling for BOSS and pool tiers, a 16-section fish-game PAR sheet, and loss-item disclosure
- 🔐 **RNG & Capture Determination** — CSPRNG per engine, the six-stage per-bullet lifecycle, fish spawning as a commonly missed RNG consumption point, deterministic replay seeds, and the full audit log field set including fish-escape events
- 🚫 **Payout Control Integrity** — Where the line sits between lawful long-term RTP design and unlawful compensated control, three behavioural detection tests, and what happens to the business model once control is removed
- 👥 **Multiplayer Fairness** — Shared pool models A/B/C, damage attribution, killing-blow rules, latency compensation with bounded rollback, seat parity verification, and collusion detection
- 🖧 **Platform & Systems** — Per-table authoritative tick loop, wallet idempotency, round replay as the replacement for static spin logs, cross-table pool controllers, and audit log volume economics
- 🏭 **Cabinet Hardware** — Coin/note acceptors, token specifications, ticket dispensers, credit-in/out authorisation, operator menu disclosure, tamper detection, and mandatory labelling
- 📋 **Certification Prep** — Which GLI standard actually applies, an 11-document submission set, lab selection, and the written technical query process
- 🛡️ **Responsible Gaming** — Continuous-spend risk unique to fish machines, auto-fire controls, bet multiplier escalation, session limits, and self-exclusion enforced before the fire request
- 🔁 **Change Management** — A five-tier change classification framework using bit-exact replay comparison as the measuring instrument, plus Taiwan's "treated as a new machine type" rule
- 🚨 **Incident Handling** — Stop-preserve-scope-then-fix sequencing and the two-sided multi-seat remediation problem
- 🔍 **AML/KYC & Data Protection** — Same-table value transfer as a laundering channel unique to fish machines, and the fact that one table's replay covers up to 8 data subjects
- 🎮 **Multi-Engine** — Unity, Cocos Creator, Unreal Engine, Godot, HTML5/PixiJS with engine-specific CSPRNG guidance

## Architecture

```
Developer (Natural Language)
    → AI Layer (Intent Understanding & Planning)
        → Fish Game Expert Power (Domain Knowledge)
            → Classification first, then risk-informed compliant implementation

Fish Game Expert (Intelligence Layer)
├── POWER.md              → Main document defining workflows & references
├── steering/             → 16 domain knowledge files
│   ├── skill-chance-classification.md    → Legal classification (the first question)
│   ├── jurisdiction-matrix.md            → Cross-market constraints
│   ├── advisory-engagement.md            → Consultant workflow, four-party boundaries
│   ├── math-model.md                     → Species table, capture model, bet tiers
│   ├── math-verification.md              → Three-layer verification & PAR sheet
│   ├── rng-capture-determination.md      → CSPRNG & per-bullet lifecycle
│   ├── payout-control-integrity.md       → The 控分 red line
│   ├── multiplayer-fairness.md           → Shared pool, damage attribution
│   ├── platform-systems-compliance.md    → Server authority, replay, pools
│   ├── cabinet-hardware-compliance.md    → Cash devices, tokens, tickets
│   ├── certification-prep.md             → Standard selection & submission
│   ├── responsible-gaming.md             → Continuous spend, auto-fire
│   ├── change-management-recert.md       → Change tiers & recertification
│   ├── incident-malfunction-handling.md  → Multi-seat remediation
│   ├── aml-kyc-player-account.md         → Same-table value transfer
│   └── data-protection-privacy.md        → Retention vs erasure for replays
├── templates/
│   ├── market-profiles/  → 23 market profiles + schema + prohibited register
│   ├── certification/    → PAR sheet, RNG package, skill/chance dossier, change request, GLI checklist
│   ├── advisory/         → Gap assessment, risk register, roadmap, incident report
│   ├── species-payout/   → Worked species payout table (8 seats, 96% RTP)
│   └── capture-model/    → Worked stochastic-HP capture model
├── hooks/                → IDE automation hooks
└── tests/                → Property-based tests (fast-check + vitest)
```

## Market coverage

**Regulated or with a defined route:** Taiwan (經濟部 電子遊戲場業), United Kingdom (UKGC), Malta (MGA), Philippines (PAGCOR), Curaçao (LOK), Brazil (SPA), Ontario (AGCO), Denmark (Spillemyndigheden), Sweden (Spelinspektionen), Nevada, Massachusetts, New Jersey, Michigan, US Tribal Class III

**Flagged as prohibited, grey or in transition:** Florida, North Carolina, Hawaii, Texas, China, South Korea, Japan, Germany, Pennsylvania

Profiles vary in depth. Markets where official sources could not be reached are shipped as **research skeletons with explicit `UNVERIFIED` markers and a verification checklist**, rather than filled in with plausible-looking numbers. Taiwan is the deepest profile because its technical and cash-out limits sit in statute rather than in non-public licence conditions — and because it is the manufacturing and export hub for this product category.

## Prerequisites

- [Kiro IDE](https://kiro.dev/docs/getting-started/installation) installed
- Node.js 18+ (for development/testing of this Power only)

## Installation

### Step 1 — Install this Power in Kiro

Open Kiro → Left panel click Powers icon → Click "+" → Select "Add Custom Power" → Select this project's root directory

### Step 2 — Install Auto-Guidance Hook (Recommended)

This hook routes each question to the right Steering File and enforces the advisory posture: confirm the jurisdiction **and the monetisation model** first, never state an unverified regulatory value as fact, and surface red flags proactively.

Two formats are shipped. Use the one matching your Kiro version:

```bash
mkdir -p .kiro/hooks

# Current agent-hook format (v1 schema: version + hooks[] + UserPromptSubmit)
cp hooks/fish-expert-guidance.json .kiro/hooks/

# Legacy format, for older Kiro builds that read .kiro.hook files
cp hooks/pre-fish-tool.kiro.hook .kiro/hooks/
```

Install only one. If you are unsure, start with `fish-expert-guidance.json` and check whether the Power activates automatically.

Without a hook, you may need to manually remind the AI to use expert knowledge.

### Verify Installation

Type any fish machine question in Kiro (e.g. "Design a 96% RTP medium volatility 8-seat fish table math model"). If the AI first asks for your target market and monetisation model rather than immediately producing a payout table, the installation is working as intended.

## Usage

Once installed, just talk to Kiro in natural language. The AI will automatically activate the Power, load the relevant Steering File, and respond as a fish machine development expert.

### What Can You Ask?

| Domain | Example Questions |
|---|---|
| Classification | "Is our fish game a skill game?", "Can we sell this in Texas?", "How do we prove the skill contribution?" |
| Math Model | "Design a species payout table for 96% RTP", "Why is our highest bet multiplier RTP lower?", "Calculate the laser cannon's RTP contribution" |
| RNG | "How do I implement CSPRNG in Unity for capture determination?", "What fields go in the audit log?", "Show me the six-stage bullet lifecycle" |
| Payout Control | "Can our probability control program pass certification?", "How do I detect compensated control in legacy code?" |
| Multiplayer | "How should damage attribution work with 8 seats?", "How do I handle lag compensation fairly?", "How do I detect chip dumping between seats?" |
| Certification | "Which GLI standard applies to an online fish game?", "What documents does a submission need?", "What does Taiwan's 評鑑分類 require?" |

### Example Workflow: Take a fish table from concept to submission

```
1. "I'm building an 8-seat fish table for the Taiwan domestic market with
    ticket redemption. Where do we start?"

2. "Design a medium volatility species payout table targeting 96% RTP that
    respects the NT$2,000 redemption cap."

3. "Set up the capture probability model and prove per-bet-multiplier RTP parity."

4. "Our legacy cabinet code has a 回收率 setting in the operator menu.
    How do I determine whether that is compensated control?"

5. "Design the damage attribution and killing-blow rules, and tell me what
    has to be disclosed to players."

6. "Run the skill-level sensitivity analysis and produce the PAR sheet sections."

7. "What does the Taiwan 評鑑分類 submission need, and what is the timeline?"
```

## Supported Game Engines

| Engine | Language | CSPRNG |
|---|---|---|
| Unity | C# | `System.Security.Cryptography.RandomNumberGenerator` |
| Cocos Creator | TypeScript | Web Crypto API / Node.js `crypto` |
| Unreal Engine | C++/Blueprint | OpenSSL `RAND_bytes` |
| Godot | GDScript/C# | `Crypto` class |
| HTML5/PixiJS | JS/TS | Web Crypto API (`crypto.getRandomValues`) |

Server-side capture determination is expected in all cases. Client-side RNG is acceptable only for non-outcome purposes such as visual jitter.

## Development

```bash
npm install
npm test              # Run all tests
npx tsc --noEmit      # TypeScript type checking
```

## Official References

All domain knowledge in this Power is sourced from verified official documentation:

| Source | URL | Domain |
|---|---|---|
| Taiwan 電子遊戲場業管理條例 | https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024 | Arcade classification, prize caps, change control |
| UKGC Skill with prizes (SWPs) | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps | Skill vs chance in GB |
| UKGC Gaming machine categories | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories | Stake and prize caps |
| Gambling Act 2005 §6 | https://www.legislation.gov.uk/ukpga/2005/19/section/6 | Game of chance definition |
| Gift Surplus v. State ex rel. Cooper (NC 2022) | https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper | Predominant factor test applied |
| Hawaii SB3281 SD1 (2026) | https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM | Names fish games as illegal devices |
| Florida Gaming Control Commission | https://flgaming.gov | Fish table enforcement |
| GLI Standards (GLI-11/GLI-19) | https://gaminglabs.com/gli-standards/ | Certification standards |
| GLI-11 Gaming Devices v3.0 | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | Device standard, game independence |
| Arizona Tribal Compact Appendix A | https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf | Equipment-to-GLI-standard mapping |
| NIGC 25 CFR Part 547 | https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547 | Class II standards; Class III has none |
| Nevada Regulation 14 | https://gaming.nv.gov | Device approval |
| Massachusetts 205 CMR 143 | https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download | Non-cash prize valuation |
| AGCO Registrar's Standards | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming | Ontario online standards |
| Danish certification programme | https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino | SCP.00–SCP.07 |
| NIST SP 800-90A Rev.1 | https://csrc.nist.gov/pubs/sp/800/90/a/r1/final | DRBG standard |
| NIST SP 800-90C | https://csrc.nist.gov/pubs/sp/800/90/c/final | RBG constructions (final 2025-09) |
| NIST decision to revise SP 800-22 | https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a | ⚠️ Rejects use for crypto RNG assessment |
| W3C Web Crypto API | https://www.w3.org/TR/WebCryptoAPI/ | Browser CSPRNG |
| BMM Testlabs | https://bmm.com/ | Testing lab |
| iTech Labs | https://itechlabs.com/ | Testing lab |
| eCOGRA | https://ecogra.org/ecogra-certification/ | Testing lab |
| GamStop (UK) | https://www.gamstop.co.uk/ | Self-exclusion |
| Spelpaus (Sweden) | https://www.spelpaus.se/ | Self-exclusion |

See POWER.md for the complete reference list.

### Three corrections worth knowing

Research for this Power surfaced three claims that circulate widely in the fish machine industry and do not survive contact with the primary sources:

1. **"Our game has a skill element, so it is not gambling."** In *Gift Surplus, LLC v. State ex rel. Cooper* (NC 2022) a device built around skilled operation was still held to be a game of chance because chance predominated — and that was under the **most** supplier-friendly of the three US tests. In Great Britain the argument fails even faster: any game whose result *can* be influenced by chance is a game of chance, and it does not matter whether skill exceeds chance or could eliminate it.

2. **Taiwan's export exemption is not a statement about the destination.** 電子遊戲場業管理條例 §6 exempts manufacture *solely for export* from the Taiwanese 評鑑分類 obligation. It says nothing about whether the device is lawful where it lands. This is where most export projects fail, and it is the single most common misreading this Power has to correct.

3. **NIST's own position is that SP 800-22 should not be used to assess cryptographic RNGs**, yet it is still commonly cited as a gaming RNG compliance basis. This Power flags that mismatch instead of propagating it.

It also discloses that **GLI and iTech Labs have been the same corporate group since May 2023**, which matters whenever a market or contract requires laboratory independence.

## Troubleshooting

| Problem | Solution |
|---|---|
| AI not responding as expert | Ensure a hook is copied to `.kiro/hooks/`. If `pre-fish-tool.kiro.hook` does not fire, your Kiro build likely expects the v1 schema — use `fish-expert-guidance.json` instead |
| AI keeps asking for my market instead of answering | This is intended behaviour. Fish machine answers are market-dependent; supply the market and monetisation model and it will proceed |
| Tests failing | Run `npm install` then retry `npm test` |
| TypeScript type errors | Run `npx tsc --noEmit` after `npm install` |

## Security

See [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications) for security issue reporting.

## License

MIT License. See the [LICENSE](LICENSE) file.
