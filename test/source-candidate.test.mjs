import test from "node:test";
import assert from "node:assert/strict";
import {forgeSourceCandidate} from "../src/source-candidate.mjs";
import {createHash} from "node:crypto";

const a="a".repeat(40), b="b".repeat(40);
const input=()=>({
  workRef:"ni:///sha-256;original-work",
  signcraftSource:{repository:"red-cup-engineering/signcraft",commitSha:a,
    exportPath:"./inference/generate"},
  synthesis:{
    kind:"signcraft.semioticSynthesis.v1",admissionLevel:"counterfactual",
    object:"code-candidate",requirements:["qualified-proposal"],
    exclusions:["unreviewed-effects"],complete:true,openRequirements:[],
    violatedExclusions:[],searchTruncated:false,statesExplored:3,
    steps:[{attr:"qualified-proposal",question:{prerequisites:[]},changed:["qualified-proposal"],
      energyChange:0}],continuationEnergy:0,
    projectedReadings:[{attribute:"qualified-proposal",reading:"potential"}],
    note:"hypothetical readings only"
  },
  artifact:{path:"src/bridge.mjs",content:"export const received = false;\n",
    producer:{repository:"red-cup-engineering/computer-code-engineering-services-section",
      commitSha:b,sourceRef:"source-fabrication:example"}}
});
test("genuine SignCraft result shape binds the original provisional artifact, not authority",()=>{
  const x=input(),snapshot=structuredClone(x),out=forgeSourceCandidate(x);
  assert.equal(out.kind,"software-forge.source-candidate.v1");
  assert.equal(out.workRef,x.workRef);
  assert.equal(out.signcraft.construction.kind,"signcraft.semioticSynthesis.v1");
  assert.deepEqual(out.signcraft.source,x.signcraftSource);
  assert.equal(out.artifact.path,x.artifact.path);
  assert.equal(out.artifact.content,x.artifact.content);
  assert.deepEqual(out.artifact.producer,x.artifact.producer);
  assert.equal(out.artifact.contentSha256,createHash("sha256").update(x.artifact.content,"utf8").digest("hex"));
  assert.deepEqual(x,snapshot,"no source mutation");
  assert.deepEqual(out.effects,[]);
  assert.equal(out.receiving.installedConsumer,"not-observed");
  assert.equal(out.receiving.nativeVerification,"not-observed");
  assert.ok(!Object.hasOwn(out,"approval"));
});
test("UTF-8 artifact digest comes from the actual bytes, not a caller-supplied hash",()=>{
  const x=input();x.artifact.content="export const greeting='wíŋyaŋ';\\n";
  const a=forgeSourceCandidate(x);
  const old=forgeSourceCandidate(input());
  assert.match(a.artifact.contentSha256,/^[0-9a-f]{64}$/u);
  assert.notEqual(a.artifact.contentSha256,old.artifact.contentSha256);
  assert.equal(a.artifact.contentSha256,createHash("sha256").update(x.artifact.content).digest("hex"));
  x.artifact.contentSha256="0".repeat(64);
  assert.throws(()=>forgeSourceCandidate(x),/source-authored code artifact/u);
});
test("unfinished, truncated or contested hypothetical syntheses cannot become forge artifacts",()=>{
  for (const change of [
    {complete:false,openRequirements:["qualified-proposal"]},
    {searchTruncated:true},
    {violatedExclusions:["unreviewed-effects"]}
  ]){
    const x=input();Object.assign(x.synthesis,change);
    const result=forgeSourceCandidate(x);
    assert.equal(result.kind,"software-forge.refusal.v1");
    assert.equal(result.code,"SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");
    assert.deepEqual(result.effects,[]);
  }
});
test("caller authorization-shaped data, other authors and unpinned source refuse",()=>{
  const x=input();x.synthesis.approved=true;
  assert.throws(()=>forgeSourceCandidate(x),/original bounded SignCraft/u);
  const y=input();y.signcraftSource.repository="red-cup-engineering/not-signcraft";
  assert.throws(()=>forgeSourceCandidate(y),/exact SignCraft/u);
  const z=input();z.artifact.producer.commitSha="not-a-commit";
  assert.throws(()=>forgeSourceCandidate(z),/pinned producer/u);
  const h=input();h.artifact.producer.grant="self-authorized";
  assert.throws(()=>forgeSourceCandidate(h),/pinned producer/u);
});
test("adverse path and size refuse before any file, branch or external effect",()=>{
  for(const path of ["../source.mjs",".git/config",".github/workflows/publish.yml",
    "/absolute.mjs","src//double.mjs","src/./hidden.mjs"]){
    const x=input();x.artifact.path=path;
    assert.throws(()=>forgeSourceCandidate(x),/code artifact/u);
  }
  const blank=input();blank.artifact.content="  ";
  assert.throws(()=>forgeSourceCandidate(blank),/code artifact/u);
  const large=input();large.artifact.content="x".repeat(1_000_001);
  assert.throws(()=>forgeSourceCandidate(large),/code artifact/u);
});

test("source candidate permanently retains every nested SignCraft step and projected reading",()=>{
  const initial=input(),original=structuredClone(initial),result=forgeSourceCandidate(initial);
  const received=result.signcraft.construction;
  const unchanged=structuredClone(received);
  assert.equal(Object.isFrozen(received),true);
  for(const fragment of [received.requirements,received.exclusions,received.steps,
    received.steps[0],received.steps[0].question,received.steps[0].question.prerequisites,
    received.steps[0].changed,received.projectedReadings,received.projectedReadings[0]])
    assert.equal(Object.isFrozen(fragment),true,"each retained original source fragment is immutable");
  assert.throws(()=>received.steps[0].changed.push("fabricated-evidence"),TypeError);
  assert.throws(()=>received.steps[0].question.prerequisites.push("fabricated-precondition"),TypeError);
  assert.throws(()=>{received.projectedReadings[0].reading="active";},TypeError);
  assert.throws(()=>{received.requirements[0]="substituted-goal";},TypeError);
  initial.synthesis.steps[0].changed.push("provider-edited-after-return");
  initial.synthesis.projectedReadings[0].reading="denied";
  assert.deepEqual(received,unchanged,"a later provider edit cannot change the retained receiving source");
  assert.equal(received.steps[0].changed.length,original.synthesis.steps[0].changed.length);
  assert.deepEqual(result.effects,[]);
  assert.equal(result.receiving.beneficiary,"not-observed",
    "an immutable counterfactual is not an independently accepted code artifact");
});

test("nonportable, cyclic, nonfinite and unbounded source constructions refuse before Git custody",()=>{
  const exotic=input();exotic.synthesis.steps[0].question.arbitrary=new Map([["hidden","unreplayable"]]);
  assert.throws(()=>forgeSourceCandidate(exotic),/bounded acyclic portable value/u);
  const cyclic=input();cyclic.synthesis.steps[0].question.loop=cyclic.synthesis.steps[0].question;
  assert.throws(()=>forgeSourceCandidate(cyclic),/bounded acyclic portable value/u);
  const nonfinite=input();nonfinite.synthesis.projectedReadings[0].reading=Infinity;
  assert.throws(()=>forgeSourceCandidate(nonfinite),/bounded acyclic portable value/u);
  const tooLarge=input();tooLarge.synthesis.note="x".repeat(260_000);
  assert.throws(()=>forgeSourceCandidate(tooLarge),/bounded portable source cut/u);
  const excessiveDepth=input();let part=excessiveDepth.synthesis.steps[0].question;
  for(let i=0;i<40;i++){part.more={};part=part.more;}
  assert.throws(()=>forgeSourceCandidate(excessiveDepth),/bounded acyclic portable value/u);
  const normal=input();assert.equal(forgeSourceCandidate(normal).kind,"software-forge.source-candidate.v1");
});
