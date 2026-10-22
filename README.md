# software-forge-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Groups forge tooling that is not specific to git. Use when adding support for a software forge concept independent of the version control system.

## Source-owned engineering forge (2026-10-22)

This existing section now provides the **effect-free software-forge candidate**
boundary. It does not replace the existing JavaScript/code fabricators,
AOE original Work, Git Services or the GitHub review/estate provider.

**Order of dependency and reception:**

1. SignCraft `@red-cup-engineering/signcraft/inference/generate` produces
   `signcraft.semioticSynthesis.v1`, a **counterfactual** construction.
2. This package's `./signcraft-source` **actually imports and calls** that
   upstream export. `./source-candidate` independently checks its bounded
   result, qualified source locator, original Work identity and **separately
   authored code artifact** with its producing source revision. It rejects
   incomplete, truncated or exclusion-violating constructions and unsafe paths.
3. The existing [Git Forge section](https://github.com/red-cup-engineering/git-forge-services-section)
   owns the Git-specific proposed-ref and exact-base boundary. It must retain
   current source/branch evidence and may not treat an intermediate packet as
   a performed Git commit.
4. [GitHub Engineering](https://github.com/red-cup-engineering/github-engineering-services-section)
   remains the only provider-specific GitHub review/write producer. Its existing
   `planBoundedReviewCall` and authenticated
   `githubReviewCallOperations` handle exact branch/file/PR effects,
   host grants, durable attempt receipts and independent provider readback.

The result `software-forge.source-candidate.v1` is a *provisional*
source candidate. It contains original `workRef`, declared pinned SignCraft
source, its unchanged hypothetical result, code `path` and exact `content`,
and declared independently produced code source. Its `effects` array is
empty; source identity, tests, release, installation, Work authority and
beneficiary receiving are **not observed** here. The source declaration is
caller data until exact package bytes and writer/consumer are independently
read. The forge cannot synthesize trustworthy source code merely from an
imagined semiotic step, nor can it manufacture a GitHub authorization.

**Compatibility and scope.** The historical direct GitHub Gitlink at
`services/github-engineering-services-section` is retained until its actual
consumer, source pin and the intermediate Git Forge custody have independent
receiving. Creating a second Gitlink, moving/deleting the existing one, or
claiming a published installed package is deliberately not part of this
source-only candidate. Current source declares SignCraft `0.5.6`; its actual
registry artifact, dependency closure and selected runtime are independent
release tests. Run `node --test test/source-candidate.test.mjs` against this
source for the dependency-free native contract, and then obtain a pinned
SignCraft install to test the real `./signcraft-source` adapter.

The original corporate Work is
`ni:///sha-256;N2B0dn3jHK7-wH7j6URwNpu2C0ofnY9zWH6saAYxI7w`.
