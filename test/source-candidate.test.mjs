import test from "node:test";
import assert from "node:assert/strict";
import {forgeSourceCandidate} from "../src/source-candidate.mjs";

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
  assert.deepEqual(out.artifact,x.artifact);
  assert.deepEqual(x,snapshot,"no source mutation");
  assert.deepEqual(out.effects,[]);
  assert.equal(out.receiving.installedConsumer,"not-observed");
  assert.equal(out.receiving.nativeVerification,"not-observed");
  assert.ok(!Object.hasOwn(out,"approval"));
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
  const large=input();large.artifact.content="x".repeat(1_000_001);
  assert.throws(()=>forgeSourceCandidate(large),/code artifact/u);
});
