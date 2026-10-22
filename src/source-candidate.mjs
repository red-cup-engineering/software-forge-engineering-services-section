/**
 * The software forge is an EFFECT-FREE boundary between SignCraft's possible
 * constructions and an independently fabricated code artifact. Neither an
 * imagined SignCraft step nor a source-author's testimony licenses a Git write.
 *
 * Selected upstream shape: @red-cup-engineering/signcraft 0.5.6
 *   synthesize(...) -> signcraft.semioticSynthesis.v1
 * The exact code-producing operation, tests, original Work and consumers remain
 * independently accountable.
 */
const SHA = /^[0-9a-f]{40}$/u;
const REPO = /^[a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9._-]*$/u;
const PATH = /^(?!\/)(?!.*\/\/)[A-Za-z0-9._\/-]+$/u;
const CONTROLS = /[\u0000-\u001f\u007f]/u;
const allowedSynthesisKeys = new Set([
  "kind", "admissionLevel", "object", "requirements", "exclusions",
  "complete", "openRequirements", "violatedExclusions", "searchTruncated",
  "statesExplored", "steps", "continuationEnergy", "projectedReadings", "note"
]);
const named = x => typeof x === "string" && x.length > 0 && x.length <= 512 && !CONTROLS.test(x);
const plain = x => x !== null && typeof x === "object" && !Array.isArray(x);
const only = (x, names) => plain(x) && Object.keys(x).every(k => names.includes(k));
const refused = code => Object.freeze({kind:"software-forge.refusal.v1",code,effects:Object.freeze([])});

export function forgeSourceCandidate({synthesis, signcraftSource, workRef, artifact}) {
  if (!only(signcraftSource,["repository","commitSha","exportPath"]) ||
      signcraftSource.repository !== "red-cup-engineering/signcraft" ||
      !SHA.test(signcraftSource.commitSha) ||
      signcraftSource.exportPath !== "./inference/generate" ||
      !named(workRef))
    throw new TypeError("exact SignCraft source and original Work required");

  if (!plain(synthesis) || Object.keys(synthesis).some(k=>!allowedSynthesisKeys.has(k)) ||
      synthesis.kind !== "signcraft.semioticSynthesis.v1" ||
      synthesis.admissionLevel !== "counterfactual" ||
      !named(synthesis.object) ||
      !Array.isArray(synthesis.requirements) || !synthesis.requirements.every(named) ||
      !Array.isArray(synthesis.exclusions) || !synthesis.exclusions.every(named) ||
      !Array.isArray(synthesis.openRequirements) ||
      !Array.isArray(synthesis.violatedExclusions) ||
      !Array.isArray(synthesis.steps) || synthesis.steps.length > 16 ||
      !Array.isArray(synthesis.projectedReadings) || synthesis.projectedReadings.length > 128 ||
      !Number.isSafeInteger(synthesis.statesExplored) || synthesis.statesExplored < 1 ||
      synthesis.statesExplored > 2048 ||
      typeof synthesis.complete !== "boolean" ||
      typeof synthesis.searchTruncated !== "boolean" ||
      typeof synthesis.continuationEnergy !== "number" ||
      !Number.isFinite(synthesis.continuationEnergy) ||
      synthesis.steps.some(s=>!plain(s)||!named(s.attr)||!plain(s.question)||
        !Array.isArray(s.changed)||s.changed.some(c=>!named(c))))
    throw new TypeError("original bounded SignCraft synthesis result required");
  // A hypothetical inability to meet the source's own construction goal is a
  // hold, not permission to tell contrary evidence or try a GitHub effect.
  if (!synthesis.complete || synthesis.searchTruncated ||
      synthesis.openRequirements.length || synthesis.violatedExclusions.length)
    return refused("SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");

  if (!only(artifact,["path","content","producer"]) ||
      !named(artifact.path) || !PATH.test(artifact.path) ||
      artifact.path.split("/").some(p=>p==="."||p===".."||p==="") ||
      /^(?:\.git(?:\/|$)|\.github\/(?:workflows|CODEOWNERS|dependabot\.ya?ml)(?:\/|$))/iu.test(artifact.path) ||
      typeof artifact.content !== "string" || !artifact.content.trim() ||
      Buffer.byteLength(artifact.content)>1_000_000 ||
      !only(artifact.producer,["repository","commitSha","sourceRef"]) ||
      !REPO.test(artifact.producer.repository) ||
      !SHA.test(artifact.producer.commitSha) ||
      !named(artifact.producer.sourceRef))
    throw new TypeError("source-authored code artifact and pinned producer required");

  const constructed = structuredClone(synthesis);
  return Object.freeze({
    kind:"software-forge.source-candidate.v1",
    admission:"provisional-source-candidate",
    workRef,
    signcraft:Object.freeze({source:Object.freeze({...signcraftSource}),construction:Object.freeze(constructed)}),
    artifact:Object.freeze({path:artifact.path,content:artifact.content,
      producer:Object.freeze({...artifact.producer})}),
    receiving:Object.freeze({
      originalSigncraftSource:"declared-not-independently-checked",
      codeProducer:"declared-not-independently-checked",
      nativeVerification:"not-observed",
      installedConsumer:"not-observed",
      beneficiary:"not-observed"
    }),
    effects:Object.freeze([])
  });
}
