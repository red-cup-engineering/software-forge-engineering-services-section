import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { makeMachineState } from "@red-cup-engineering/signcraft/inference/kernel";
import { semanticId, cellSetAddress } from "@red-cup-engineering/signcraft/cell";
import { assessCommunityRequirements } from "@red-cup-engineering/social-publication-services-section/community-evidence";
import { communityWorkOrder, admitCommunityWorkOrder } from "../src/community-work-order.mjs";
import { communitySourceCandidate, synthesizeCommunitySourceCandidate } from "../src/community-source-candidate.mjs";
import { contributionContractSchema } from "./fixtures/contribution-contract.mjs";

const subject = "urn:github:repository:123", at = "2026-10-27T00:00:00.000Z";
const source = { url: "https://api.github.com/repos/example/project/community/profile", observedAt: at, provider: "github",
  repository: "example/project", repositoryId: 123, visibility: "public", coverage: { complete: true, scope: "contribution-contract" } };
const rule = { id: "contribution-contract", title: "Machine-readable contribution contract", subject,
  predicate: "repository.contribution-contract", operator: "nonempty", priority: 75,
  sourceContract: { kind: "repository-file", path: "src/contribution-contract.mjs", role: "runtime-schema" },
  action: { kind: "fabricate-contribution-contract", description: "Generate the specified contribution contract from its source schema." } };
const workRef = "ni:///sha-256;N2B0dn3jHK7-wH7j6URwNpu2C0ofnY9zWH6saAYxI7w";
const target = { repository: "example/project", commitSha: "b".repeat(40), path: "src/contribution-contract.mjs", blobSha: null };
const signcraftSource = { repository: "red-cup-engineering/signcraft", commitSha: "0257d0b3719d95f3b4649610bd5839ccbd6e914d", exportPath: "./inference/generate" };
const observed = value => ({ subject, predicate: rule.predicate, value, status: "observed", source });
const assessment = (observations = [observed(null)]) => assessCommunityRequirements({
  batch: { kind: "forge.community-observations.v1", subject, observedAt: at, observations, effects: [] }, requirements: [rule] });
const order = value => communityWorkOrder({ assessment: value ?? assessment(), requirementId: rule.id, workRef, target });
const maker = JSON.parse(readFileSync(new URL("./fixtures/contribution-contract-source.json", import.meta.url), "utf8"));
const generatedContent = readFileSync(new URL("./fixtures/contribution-contract.mjs", import.meta.url), "utf8");
const artifact = () => ({ path: target.path, content: generatedContent, producer: maker.producer });

function produce(workOrder, options) {
  const attribute = workOrder.requirement.definitionAddress;
  const machine = makeMachineState({ objects: ["reference-contract"], attributes: [attribute], incidencePairs: [["reference-contract", attribute]] });
  return synthesizeCommunitySourceCandidate({ workOrder, artifact: artifact(), signcraftSource,
    ctx: machine.ctx, basis: machine.basis, complex: machine.cx, valuation: machine.v, options });
}

test("a replayed unmet requirement becomes a source work order with exact original evidence and target", () => {
  const input = assessment(), result = order(input);
  assert.equal(result.kind, "software-forge.community-work-order.v1");
  assert.equal(result.workRef, workRef);
  assert.equal(result.requirement.id, rule.id);
  assert.equal(result.requirement.cellAddress, input.requirements[0].cellAddress);
  assert.deepEqual(result.source.sourceCellAddresses, input.requirements[0].evidence);
  assert.equal(result.source.assessment, input.id);
  assert.equal(result.source.evidence, input.evidence.id);
  assert.deepEqual(result.basis, input);
  assert.deepEqual(result.target, target);
  assert.equal(result.cellSetAddress, cellSetAddress(result.cells));
  assert.equal(admitCommunityWorkOrder(result).id, result.id);
  assert.equal(result.acceptance.observedStatus, "not-reobserved");
  assert.deepEqual(result.effects, []);
});

test("held, unknown, incomplete and contradictory claims keep their original observation work", () => {
  for (const input of [assessment([observed({ present: true })]), assessment([]),
    assessment([{ ...observed([]), source: { ...source, coverage: { complete: false, scope: "sample" } } }]),
    assessment([observed(null), observed({ present: true })])]) {
    const result = order(input);
    assert.equal(result.kind, "software-forge.community-work-refusal.v1");
    assert.equal(result.code, "COMMUNITY_REQUIREMENT_NOT_UNOPPOSED_UNMET");
    assert.deepEqual(result.effects, []);
  }
});

test("forging a new canonical assessment id does not bypass semantic source replay", () => {
  const forged = structuredClone(assessment([observed({ present: true })]));
  forged.requirements[0].reading = "denied";
  const { id, ...body } = forged;
  forged.id = semanticId(body);
  assert.throws(() => order(forged), /does not replay/u);
  const alteredEvidence = structuredClone(assessment());
  alteredEvidence.evidence.id = semanticId({ unrelated: true });
  const { id: oldId, ...alteredBody } = alteredEvidence;
  alteredEvidence.id = semanticId(alteredBody);
  assert.throws(() => order(alteredEvidence), /does not replay/u);
});

test("target source scope, protected files and unpinned source revisions refuse", () => {
  const input = { assessment: assessment(), requirementId: rule.id, workRef, target };
  assert.equal(communityWorkOrder({ ...input, target: { ...target, repository: "different/project" } }).code, "COMMUNITY_SOURCE_TARGET_MISMATCH");
  assert.throws(() => communityWorkOrder({ ...input, target: { ...target, commitSha: "main" } }), /exact repository commit/u);
  assert.throws(() => communityWorkOrder({ ...input, target: { ...target, path: "../outside.mjs" } }), /exact repository commit/u);
  assert.throws(() => communityWorkOrder({ ...input, target: { ...target, path: ".github/workflows/publish.yml" } }), /exact repository commit/u);
});

test("every source occurrence must affirmatively name the target repository", () => {
  const { repository, ...unboundSource } = source;
  const unbound = { ...observed(null), source: unboundSource };
  for (const observations of [[unbound], [observed(null), unbound]]) {
    assert.equal(order(assessment(observations)).code, "COMMUNITY_SOURCE_TARGET_MISMATCH");
    assert.equal(communityWorkOrder({ assessment: assessment(observations), requirementId: rule.id, workRef,
      target: { ...target, repository: "unrelated/project" } }).code, "COMMUNITY_SOURCE_TARGET_MISMATCH");
  }
  assert.equal(order(assessment([{ ...observed(null), source: { ...source, repository: "EXAMPLE/PROJECT" } }])).kind,
    "software-forge.community-work-order.v1");
});

test("source work refuses metadata effects and enforces the authored or recognized source relationship", () => {
  const withRule = changed => assessCommunityRequirements({ batch: { kind: "forge.community-observations.v1", subject, observedAt: at,
    observations: [{ ...observed(null), predicate: changed.predicate }], effects: [] }, requirements: [changed] });
  const metadata = withRule({ ...rule, predicate: "repository.topics" });
  assert.equal(order(metadata).code, "COMMUNITY_REQUIREMENT_REQUIRES_PROVIDER_EFFECT");
  const readme = withRule({ ...rule, predicate: "repository.readme" });
  assert.equal(order(readme).code, "COMMUNITY_REQUIREMENT_SOURCE_RELATION_MISSING");
  const wrongPath = withRule({ ...rule, sourceContract: { ...rule.sourceContract, path: "src/different.mjs" } });
  assert.equal(order(wrongPath).code, "COMMUNITY_REQUIREMENT_SOURCE_RELATION_MISMATCH");
  const { sourceContract, ...readmeRule } = { ...rule, predicate: "repository.readme" };
  const input = withRule(readmeRule);
  assert.equal(communityWorkOrder({ assessment: input, requirementId: rule.id, workRef,
    target: { ...target, path: "README.md" } }).kind, "software-forge.community-work-order.v1");
});

test("actual native SignCraft synthesis binds actual Code-produced executable source to the same requirement", () => {
  const workOrder = order(), result = produce(workOrder);
  assert.equal(result.kind, "software-forge.community-source-candidate.v1");
  assert.equal(result.candidate.kind, "software-forge.source-candidate.v1");
  assert.equal(result.candidate.workRef, workRef);
  assert.equal(result.requirement.id, rule.id);
  assert.equal(result.candidate.signcraft.construction.object, workOrder.id);
  assert.ok(result.candidate.signcraft.construction.requirements.includes(workOrder.requirement.definitionAddress));
  assert.equal(result.candidate.artifact.content, generatedContent);
  assert.deepEqual(result.candidate.signcraft.source, signcraftSource);
  assert.deepEqual(result.candidate.artifact.producer, maker.producer);
  assert.equal(result.candidate.artifact.contentSha256, maker.contentSha256);
  assert.equal(maker.contentSha256, createHash("sha256").update(generatedContent).digest("hex"));
  assert.deepEqual(contributionContractSchema, maker.input[0].schema);
  assert.equal(Object.isFrozen(contributionContractSchema.properties), true);
  assert.equal(result.receiving, "not-reobserved");
  assert.deepEqual(result.effects, []);
});

test("an unrelated artifact or nominally complete synthesis cannot substitute for this source work", () => {
  const workOrder = order(), candidate = produce(workOrder).candidate;
  assert.throws(() => communitySourceCandidate({ workOrder, artifact: { ...artifact(), path: "src/unrelated.mjs" }, synthesis: candidate.signcraft.construction, signcraftSource }), /artifact path differs/u);
  assert.throws(() => communitySourceCandidate({ workOrder, artifact: artifact(), synthesis: { ...candidate.signcraft.construction, object: "unrelated" }, signcraftSource }), /must name this work order/u);
  assert.throws(() => communitySourceCandidate({ workOrder, artifact: artifact(), synthesis: { ...candidate.signcraft.construction, requirements: ["unrelated"] }, signcraftSource }), /must name this work order/u);
});

test("bounded native synthesis refusal cannot be relabeled as a source candidate", () => {
  const workOrder = order();
  const result = produce(workOrder, { maxStates: 1, maxSteps: 0 });
  assert.equal(result.kind, "software-forge.refusal.v1");
  assert.equal(result.code, "SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");
  assert.deepEqual(result.effects, []);
});

test("portable work order mutations require complete source re-admission", () => {
  const result = order(), changed = structuredClone(result);
  changed.target.path = "src/changed.mjs";
  assert.throws(() => admitCommunityWorkOrder(changed), /canonical content/u);
  const { id, ...body } = changed; changed.id = semanticId(body);
  assert.throws(() => admitCommunityWorkOrder(changed), /does not replay/u);
});
