# Contributing to Fish Game Expert

Thank you for your interest in contributing. This Power is a compliance advisor, so contributions are held to an unusual standard: **the accuracy of a regulatory value matters more than the volume of content.**

## The one rule that matters most

**Never contribute a regulatory value you have not read in a primary source.**

Every regulatory value in this repository carries a confidence level:

| Level | Meaning |
|---|---|
| `HIGH` | Read directly from the official instrument: statute text, regulator standard, court judgment, or standards-body document |
| `MEDIUM` | From a regulator website summary, an authoritative industry source, or a law firm analysis. Usable as a planning assumption, must be upgraded before submission |
| `UNVERIFIED` | Not confirmed. The `value` must be `null` and any `status` must be `"unverified"` |

A pull request that fills an `UNVERIFIED` field with a plausible-looking number will be rejected even if the number happens to be right, because the provenance is what makes the value usable. A pull request that converts a wrong `MEDIUM` into an honest `UNVERIFIED` with a verification path is a valuable contribution.

Acceptable sources: regulator official sites and documents, legislature and statute databases, court opinions, standards bodies (GLI, NIST, W3C), and official government publications.

Not acceptable as a basis for `HIGH` or `MEDIUM`: industry blogs, vendor marketing pages, affiliate or casino-review sites, aggregator wikis, or another Power's content.

## Types of contribution we especially want

1. **Upgrading `UNVERIFIED` to `HIGH`** with a citation precise enough to retrieve (instrument name plus article or section number).
2. **Correcting a value** with the primary source that contradicts it.
3. **New market profiles**, ideally for markets where fish machines are actually supplied.
4. **Written technical query outcomes.** If you asked a regulator or laboratory how a rule maps onto a fish machine and got an answer in writing, that answer is high-value content this Power cannot obtain any other way.
5. **Engine-specific implementation guidance** for CSPRNG and server-authoritative capture determination.

## What we will not accept

- Guidance on how to conceal a compensated payout control mechanism from a test laboratory.
- Content that presents a market as viable where the register records it as prohibited.
- Legal conclusions. This Power provides technical compliance analysis; it does not give legal advice, and contributions must preserve that boundary.

## Development setup

```bash
npm install
npm test              # Run all tests
npx tsc --noEmit      # Type checking
```

## Repository conventions

- **Steering files** are written in Traditional Chinese with legal and technical terms retained in their original language. Each begins with a single level-1 heading and ends with a `需要主動說出的事` section.
- **Cross-references** to other steering files use the bare filename in backticks, e.g. `` `math-model.md` ``. Cross-references to templates use the path form `templates/<category>/<name>.json`. The test suite verifies that every such reference resolves.
- **Every steering file must be registered in `POWER.md`** with a `trigger` and a `description`, and must be routable from every shipped hook. An unregistered or unroutable steering file is dead weight, and the tests fail on it.
- **Templates** declare a namespaced, versioned `templateType` of the form `fish-game-expert/<name>-v<N>`. Market profiles deliberately share one `templateType`; every other template has its own.
- **Worked examples** (the species payout table and the capture model) must be arithmetically self-consistent. The tests recompute their numbers.

## Before opening a pull request

1. `npm test` passes.
2. `npx tsc --noEmit` is clean.
3. Any new steering file is registered in `POWER.md` and referenced in both hooks.
4. Any new regulatory value carries a confidence level and, if not `HIGH`, appears in the relevant `verificationRequired` list.
5. Counts stated in prose across the five READMEs are still correct.

## Security issue notifications

If you discover a security issue in this repository, please report it privately rather than opening a public issue. Do not include exploit details or credentials in a public issue or pull request.

Note the distinction relevant to this project: a factual error in a regulatory value is not a security issue and should be reported as a normal issue. A vulnerability in the tooling or a leaked credential is a security issue.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
