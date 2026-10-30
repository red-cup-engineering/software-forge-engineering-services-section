/**
 * The software forge is an EFFECT-FREE boundary between SignCraft's possible
 * constructions and an independently fabricated code artifact. Neither an
 * imagined SignCraft step nor a source-author's testimony licenses a Git write.
 *
 * Selected upstream shape: @red-cup-engineering/signcraft 0.6.2
 *   synthesize(...) -> signcraft.semioticSynthesis.v1
 * The exact code-producing operation, tests, original Work and consumers remain
 * independently accountable.
 */
import {createHash} from "node:crypto";
import {isDeepStrictEqual} from "node:util";
import {retainedCarrier} from "@red-cup-engineering/signcraft/cell";
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

/** Retain SignCraft's actual inert source carrier under the existing source-owned
 * SignCell/Content Address semantics. The Forge adds only its domain bounds:
 * no duplicate object copier, setter-sensitive JSON clone, or freeze algorithm.
 * These limits are specific to a provisional code candidate, not generic Cells. */
function boundedConstruction(copy) {
  const pending = [{value:copy,depth:0}];
  let nodes = 0;
  while (pending.length) {
    const {value,depth} = pending.pop();
    if (value === null || typeof value === "string" || typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value))) continue;
    if (typeof value !== "object" || depth > 32 || ++nodes > 8192 ||
        (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype))
      throw new TypeError("software forge: construction exceeds the bounded portable source profile");
    for (const member of Object.values(value)) pending.push({value:member,depth:depth+1});
  }
  if (Buffer.byteLength(JSON.stringify(copy), "utf8") > 256_000)
    throw new TypeError("software forge: construction exceeds the bounded portable source cut");
  return copy;
}

/** An upstream inert carrier is the sole source read. The original construction,
 * source pin, Work and Code bytes are checked and returned from THAT snapshot.
 * Untrusted getters/Proxies are not valid Semiotic Content Address source data. */
export function forgeSourceCandidate(input) {
  const source = retainedCarrier(input);
  if (!only(source,["synthesis","signcraftSource","workRef","artifact"]))
    throw new TypeError("original Forge source input required");
  const {signcraftSource,workRef,artifact} = source;
  const synthesis = boundedConstruction(source.synthesis);
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

  return retainedCarrier({
    kind:"software-forge.source-candidate.v1",
    admission:"provisional-source-candidate",
    workRef,
    signcraft:{source:signcraftSource,construction:synthesis},
    artifact:{path:artifact.path,content:artifact.content,
      contentSha256:createHash("sha256").update(artifact.content,"utf8").digest("hex"),
      producer:artifact.producer},
    receiving:{
      originalSigncraftSource:"declared-not-independently-checked",
      codeProducer:"declared-not-independently-checked",
      nativeVerification:"not-observed",
      installedConsumer:"not-observed",
      beneficiary:"not-observed"
    },
    effects:[]
  });
}

/** Replay a transported provisional candidate using the ORIGINAL Forge maker.
 * This is an exact source/shape readback, not an independent source checkout,
 * an authorization, an installed artifact, or the beneficiary's assent.
 * A separate original Work/Code/source selection is REQUIRED; a carrier cannot
 * authenticate its own source declarations or confer rights by replaying them.
 * A forged receiving verdict, extra field, altered source byte or moved digest
 * cannot be smuggled through the Git boundary as an alleged maker result. */
export function qualifyForgeSourceCandidate(candidate, sourceSelection) {
  const received = retainedCarrier(candidate);
  const selected = retainedCarrier(sourceSelection);
  if (!only(received,["kind","admission","workRef","signcraft","artifact","receiving","effects"]) ||
      received.kind !== "software-forge.source-candidate.v1" ||
      !plain(received.signcraft) || !plain(received.artifact))
    throw new TypeError("original Forge source candidate required");
  // A syntactically valid but substituted commit or Code source reference
  // cannot be detected by re-reading only the untrusted candidate. Compare
  // against the original Work/Source selection supplied independently by
  // the consumer's actual custody/receiving authority, never from candidate.
  if (!only(selected,["workRef","signcraftSource","artifact"]) ||
      !only(selected.artifact,["path","contentSha256","producer"]) ||
      !isDeepStrictEqual(selected,{
        workRef:received.workRef,
        signcraftSource:received.signcraft.source,
        artifact:{path:received.artifact.path,
          contentSha256:received.artifact.contentSha256,
          producer:received.artifact.producer}
      }))
    throw new TypeError("Forge candidate differs from the independently selected original Work and source");
  const replayed = forgeSourceCandidate({
    synthesis:received.signcraft.construction,
    signcraftSource:received.signcraft.source,
    workRef:received.workRef,
    artifact:{path:received.artifact.path,content:received.artifact.content,
      producer:received.artifact.producer}
  });
  if (replayed.kind !== "software-forge.source-candidate.v1" || !isDeepStrictEqual(received,replayed))
    throw new TypeError("Forge candidate does not replay from its original source contract");
  return replayed;
}
