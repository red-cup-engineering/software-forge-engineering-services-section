import {synthesize} from "@red-cup-engineering/signcraft/inference/generate";
import {forgeSourceCandidate} from "./source-candidate.mjs";

/**
 * Actual downstream SignCraft call. An authored candidate still needs an
 * independently qualified code producer, tests, receiving and host admission.
 */
export function synthesizeForgeSource({
  ctx, basis, complex, valuation, object, options,
  signcraftSource, workRef, artifact
}) {
  return forgeSourceCandidate({
    synthesis:synthesize(ctx,basis,complex,valuation,object,options),
    signcraftSource,workRef,artifact
  });
}
