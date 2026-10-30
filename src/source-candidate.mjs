/**
 * The software forge is an EFFECT-FREE boundary between SignCraft's possible
 * constructions and an independently fabricated code artifact. Neither an
 * imagined SignCraft step nor a source-author's testimony licenses a Git write.
 *
 * Selected upstream shape: @red-cup-engineering/signcraft 0.6.1-dev.508
 *   synthesize(...) -> signcraft.semioticSynthesis.v1
 * The exact code-producing operation, tests, original Work and consumers remain
 * independently accountable.
 */
import {createHash} from "node:crypto";
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

/** Retain one finite, serializable counterfactual before another source owner
 * reads it. A frozen wrapper around mutable nested steps is not a fixed
 * witness; the original SignCraft synthesis remains a proposal, not authority.
 * This does not introduce another SignCell identity or work journal. */
function retainConstruction(original) {
  const copy = structuredClone(original);
  const active = new WeakSet(), complete = new WeakSet();
  let nodes = 0;
  const freeze = (value, depth) => {
    if (value === null || typeof value === "string" || typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value))) return;
    if (typeof value !== "object" || depth > 32 || ++nodes > 8192 ||
        active.has(value) ||
        (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype))
      throw new TypeError("software forge: construction must be a bounded acyclic portable value");
    if (complete.has(value)) return;
    active.add(value);
    for (const child of Object.values(value)) freeze(child, depth + 1);
    active.delete(value);
    complete.add(value);
    Object.freeze(value);
  };
  freeze(copy, 0);
  if (Buffer.byteLength(JSON.stringify(copy), "utf8") > 256_000)
    throw new TypeError("software forge: construction exceeds the bounded portable source cut");
  return copy;
}

export function forgeSourceCandidate({synthesis: sourceSynthesis, signcraftSource: sourceSigncraft,
  workRef, artifact: sourceArtifact}) {
  // Admit exactly the values that are retained. Calling authored getters again
  // after checking them can change completion, source identity or code bytes.
  const synthesis = plain(sourceSynthesis) ? retainConstruction(sourceSynthesis) : sourceSynthesis;
  const signcraftSource = plain(sourceSigncraft) ? structuredClone(sourceSigncraft) : sourceSigncraft;
  const artifact = plain(sourceArtifact) ? structuredClone(sourceArtifact) : sourceArtifact;
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

  return Object.freeze({
    kind:"software-forge.source-candidate.v1",
    admission:"provisional-source-candidate",
    workRef,
    signcraft:Object.freeze({source:Object.freeze({...signcraftSource}),construction:synthesis}),
    artifact:Object.freeze({path:artifact.path,content:artifact.content,
      contentSha256:createHash("sha256").update(artifact.content,"utf8").digest("hex"),
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
