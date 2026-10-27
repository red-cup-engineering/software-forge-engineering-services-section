import { cell, cellSet, cellSetAddress, retainedCarrier, semanticId } from "@red-cup-engineering/signcraft/cell";
import { synthesize } from "@red-cup-engineering/signcraft/inference/generate";
import { forgeSourceCandidate } from "./source-candidate.mjs";
import { admitCommunityWorkOrder } from "./community-work-order.mjs";

/**
 * Preserve the exact original candidate shape for Git Forge. The surrounding
 * evidence binds it to the unmet community requirement and exact source target.
 * Native source verification and later provider re-observation remain distinct.
 */
export function communitySourceCandidate({ workOrder, artifact, synthesis, signcraftSource } = {}) {
  const order = admitCommunityWorkOrder(workOrder);
  if (artifact?.path !== order.target.path) throw new TypeError("community artifact path differs from the admitted work order");
  if (synthesis?.object !== order.id || !Array.isArray(synthesis.requirements) ||
      !synthesis.requirements.includes(order.requirement.definitionAddress))
    throw new TypeError("SignCraft construction must name this work order and its exact requirement");
  const candidate = forgeSourceCandidate({ synthesis, signcraftSource, workRef: order.workRef, artifact });
  if (candidate.kind === "software-forge.refusal.v1") return candidate;
  const candidateId = semanticId(candidate);
  const relation = cell(order.id, "has-source-candidate", candidateId,
    { for: [{ requirement: order.requirement, source: order.source, artifactDigest: candidate.artifact.contentSha256 }] });
  const cells = cellSet([...order.cells, relation]);
  const body = retainedCarrier({ kind: "software-forge.community-source-candidate.v1", workOrder: order.id,
    requirement: order.requirement, target: order.target, acceptance: order.acceptance,
    candidate, candidateId, cells, cellSetAddress: cellSetAddress(cells),
    authority: "not-conferred", sourceVerification: "not-observed", receiving: "not-reobserved", effects: [] });
  return retainedCarrier({ id: semanticId(body), ...body });
}

/** Execute the actual existing SignCraft producer before the unchanged forge boundary. */
export function synthesizeCommunitySourceCandidate({ workOrder, artifact, signcraftSource,
  ctx, basis, complex, valuation, options = {} } = {}) {
  const order = admitCommunityWorkOrder(workOrder);
  if (options.required !== undefined && (!Array.isArray(options.required) ||
      !options.required.includes(order.requirement.definitionAddress)))
    throw new TypeError("community synthesis must preserve the exact requirement attribute");
  const selected = { ...options, required: options.required ?? [order.requirement.definitionAddress] };
  return communitySourceCandidate({ workOrder: order, artifact, signcraftSource,
    synthesis: synthesize(ctx, basis, complex, valuation, order.id, selected) });
}
