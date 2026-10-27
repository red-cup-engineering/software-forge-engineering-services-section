import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {makeMachineState} from "@red-cup-engineering/signcraft/inference/kernel";
import {withReading,readingAt} from "@red-cup-engineering/signcraft/inference/nuclei";
import {synthesizeForgeSource} from "../src/signcraft-source.mjs";

const actualSigncraftCommit = "0257d0b3719d95f3b4649610bd5839ccbd6e914d";
const producerCommit = "a".repeat(40);
const workRef = "ni:///sha-256;N2B0dn3jHK7-wH7j6URwNpu2C0ofnY9zWH6saAYxI7w";
const field = () => makeMachineState({
  objects:["a-only","b-only","both"],attributes:["a","b"],
  incidencePairs:[["a-only","a"],["b-only","b"],["both","a"],["both","b"]]
});
const artifact=()=>({
  path:"src/qualified.mjs",content:"export const qualified = true;\n",
  producer:{repository:"red-cup-engineering/computer-code-engineering-services-section",
    commitSha:producerCommit,sourceRef:"original-code-fabrication:fixture"}
});
const input=(machine,options={required:["a","b"]})=>({
  ctx:machine.ctx,basis:machine.basis,complex:machine.cx,valuation:machine.v,
  object:"design",options,artifact:artifact(),workRef,
  signcraftSource:{repository:"red-cup-engineering/signcraft",commitSha:actualSigncraftCommit,
    exportPath:"./inference/generate"}
});

test("the ORIGINAL SignCraft construction feeds the source forge without creating evidence or effects",()=>{
  const machine=field(),valuation=new Map(machine.v);
  const out=synthesizeForgeSource(input(machine));
  assert.equal(out.kind,"software-forge.source-candidate.v1");
  assert.equal(out.admission,"provisional-source-candidate");
  assert.deepEqual(out.signcraft.construction.requirements,["a","b"]);
  assert.equal(out.signcraft.construction.complete,true);
  assert.equal(out.signcraft.construction.steps.length,2);
  assert.deepEqual(new Set(out.signcraft.construction.steps.map(s=>s.attr)),new Set(["a","b"]));
  assert.equal(out.artifact.contentSha256,createHash("sha256").update(artifact().content,"utf8").digest("hex"));
  assert.equal(out.workRef,workRef);
  assert.deepEqual(out.effects,[]);
  assert.deepEqual(machine.v,valuation);
  assert.equal(readingAt(machine.v,"design","a"),"absurd");
  assert.equal(out.receiving.installedConsumer,"not-observed");
});

test("an actual truncated/step-limited SignCraft synthesis is refused at the forge boundary",()=>{
  const m=field();
  const out=synthesizeForgeSource(input(m,{required:["a","b"],maxSteps:1}));
  assert.equal(out.kind,"software-forge.refusal.v1");
  assert.equal(out.code,"SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");
  assert.deepEqual(out.effects,[]);
  const truncated=synthesizeForgeSource(input(m,{required:["a","b"],maxStates:1}));
  assert.equal(truncated.code,"SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");
});

test("actual opposed input testimony does not create a source forge authorization",()=>{
  const m=field(),contrary=withReading(m.v,"design","a","active");
  const result=synthesizeForgeSource({...input(m,{required:["a"]}),valuation:contrary});
  assert.equal(result.kind,"software-forge.refusal.v1");
  assert.equal(result.code,"SIGNCRAFT_CONSTRUCTION_NOT_COMPLETE");
  assert.equal(readingAt(contrary,"design","a"),"active");
});
