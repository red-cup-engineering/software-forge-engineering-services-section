/** Exact community requirements enter the existing software forge as source work.
 * Native Cells name the requirement and evidence; the current Code owner remains
 * responsible for producing source, and Git/provider owners retain effects.
 */
import { address, cell, cellSet, cellSetAddress, coincides, retainedCarrier, semanticId } from "@red-cup-engineering/signcraft/cell";
import { assessCommunityRequirements, compareCommunityAssessments } from "@red-cup-engineering/social-publication-services-section/community-evidence";

const SHA = /^[0-9a-f]{40}$/u;
const REPO = /^[a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9._-]*$/u;
const PATH = /^(?!\/)(?!.*\/\/)[A-Za-z0-9._\/-]+$/u;
const named = value => typeof value === "string" && value.trim() && value.length <= 512 && !/[\u0000-\u001f\u007f]/u.test(value);
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
const only = (value, keys) => plain(value) && Object.keys(value).every(key => keys.includes(key));
const refusal = (code, message) => retainedCarrier({ kind: "software-forge.community-work-refusal.v1", code, message, effects: [] });
const providerPredicates = new Set(["repository.description", "repository.topics", "repository.homepage",
  "repository.stars", "repository.subscribers", "repository.forks", "repository.open-items",
  "repository.open-issues-sample", "repository.open-pulls-sample", "repository.releases-sample",
  "repository.traffic-views", "repository.traffic-clones", "repository.traffic-referrers"]);
const sourcePaths = {
  "repository.readme": /^(?:(?:\.github|docs)\/)?README(?:\.(?:md|markdown|rst|txt))?$/iu,
  "repository.contributing": /^(?:(?:\.github|docs)\/)?CONTRIBUTING(?:\.(?:md|markdown|rst|txt))?$/iu,
  "repository.license": /^(?:LICENSE|COPYING)(?:\.(?:md|markdown|rst|txt))?$/iu,
};

function replayAssessment(assessment) {
  // Its declared address must match its actual finite carrier, then its source
  // observations and requirement definitions must reproduce the claimed reading.
  // Hashing a forged 'denied' value is therefore not a work-order admission.
  compareCommunityAssessments(assessment, assessment);
  const replay = assessCommunityRequirements({ batch: assessment.evidence.batch,
    requirements: assessment.requirements.map(row => row.requirement) });
  if (!coincides(replay.requirements, assessment.requirements) || replay.evidence.id !== assessment.evidence.id ||
      replay.subject !== assessment.subject || replay.observedAt !== assessment.observedAt)
    throw new TypeError("community assessment does not replay from its original source observations");
  return replay;
}

function admittedTarget(target) {
  if (!only(target, ["repository", "commitSha", "path", "blobSha"]) || !REPO.test(target.repository ?? "") ||
      !SHA.test(target.commitSha ?? "") || !(target.blobSha === null || SHA.test(target.blobSha ?? "")) ||
      !named(target.path) || !PATH.test(target.path) ||
      target.path.split("/").some(part => !part || part === "." || part === "..") ||
      /^(?:\.git(?:\/|$)|\.github\/(?:workflows|CODEOWNERS|dependabot\.ya?ml)(?:\/|$))/iu.test(target.path))
    throw new TypeError("community source work requires an exact repository commit, file path and prior blob or explicit absence");
  return retainedCarrier(target);
}

/**
 * Translate a source-replayed, unopposed unmet requirement into actual forge input.
 * Exact target declarations are retained for the Git reader; they are not a claim
 * that this pure function independently fetched a repository or reserved a writer.
 */
export function communityWorkOrder({ assessment, requirementId, workRef, target } = {}) {
  if (!named(requirementId) || !named(workRef)) throw new TypeError("original requirement id and Work reference are required");
  const actual = replayAssessment(assessment), destination = admittedTarget(target);
  const requirement = actual.requirements.find(row => row.id === requirementId);
  if (!requirement) return refusal("COMMUNITY_REQUIREMENT_NOT_PRESENT", "The named requirement is absent from the source assessment.");
  if (requirement.reading !== "denied") return refusal("COMMUNITY_REQUIREMENT_NOT_UNOPPOSED_UNMET",
    "Source work requires an unopposed unmet requirement; unknown, held and contested conditions keep their observation or reconciliation work.");
  const definition = requirement.requirement;
  if (providerPredicates.has(definition.predicate)) return refusal("COMMUNITY_REQUIREMENT_REQUIRES_PROVIDER_EFFECT",
    "This requirement concerns provider metadata, engagement or a service observation; a source-file edit does not establish it.");
  const expectedPath = Object.hasOwn(sourcePaths, definition.predicate) ? sourcePaths[definition.predicate] : null;
  const contract = definition.sourceContract;
  if (expectedPath ? !expectedPath.test(destination.path) : !contract || contract.kind !== "repository-file")
    return refusal("COMMUNITY_REQUIREMENT_SOURCE_RELATION_MISSING", "The requirement does not allocate its behavior to this source path.");
  if (contract && contract.path !== destination.path)
    return refusal("COMMUNITY_REQUIREMENT_SOURCE_RELATION_MISMATCH", "The source specification names a different target path.");
  const sources = actual.evidence.observations.filter(entry => requirement.evidence.includes(entry.sourceCellAddress));
  if (sources.length === 0 || sources.some(entry => typeof entry.observation.source.repository !== "string" ||
      entry.observation.source.repository.toLowerCase() !== destination.repository.toLowerCase()))
    return refusal("COMMUNITY_SOURCE_TARGET_MISMATCH", "Requirement evidence does not identify the intended source repository.");
  const acceptance = { kind: "community-reobservation", subject: actual.subject, predicate: definition.predicate,
    operator: definition.operator, ...(Object.hasOwn(definition, "expected") ? { expected: definition.expected } : {}),
    sourceContract: contract ?? { kind: "repository-file", path: destination.path, role: "documentation" },
    requiredReading: "held", observedStatus: "not-reobserved" };
  const requirementRef = { id: requirement.id, definitionAddress: requirement.definitionAddress, cellAddress: requirement.cellAddress };
  const orderCell = cell(workRef, "proposes-source-change", { requirement: requirementRef, target: destination, acceptance },
    { for: [{ assessment: assessment.id, evidence: actual.evidence.id, sources: requirement.evidence }] });
  const sourceCells = actual.evidence.cells.filter(value => requirement.evidence.includes(address(value)));
  const cells = cellSet([...sourceCells, requirement.cell, orderCell]);
  const body = retainedCarrier({ kind: "software-forge.community-work-order.v1", workRef,
    requirement: requirementRef, target: destination, acceptance,
    source: { assessment: assessment.id, evidence: actual.evidence.id, subject: actual.subject, observedAt: actual.observedAt,
      sourceCellAddresses: requirement.evidence },
    // Retain the source carrier needed to replay the decision after transport;
    // this is an immutable work-order input, not a new queue or durable ledger.
    basis: assessment, cells, cellSetAddress: cellSetAddress(cells), orderCellAddress: address(orderCell),
    sourceStanding: "caller-presented-sources-with-replayed-requirement-reading",
    targetStanding: "declared-exact-source-awaiting-git-reader", authority: "not-conferred", effects: [] });
  return retainedCarrier({ id: semanticId(body), ...body });
}

/** Recreate a portable work order through the same source and native Cell owners. */
export function admitCommunityWorkOrder(workOrder) {
  if (!plain(workOrder) || workOrder.kind !== "software-forge.community-work-order.v1") throw new TypeError("a community source work order is required");
  const { id, ...body } = workOrder;
  if (id !== semanticId(body)) throw new TypeError("community work order differs from its canonical content");
  const replay = communityWorkOrder({ assessment: workOrder.basis, requirementId: workOrder.requirement?.id,
    workRef: workOrder.workRef, target: workOrder.target });
  if (replay.kind !== workOrder.kind || !coincides(replay, workOrder)) throw new TypeError("community work order does not replay from its source");
  return replay;
}
