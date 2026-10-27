/** Generated from specifications/*.schema.json. Do not edit. */
const __freezeGeneratedSchema = value => {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) __freezeGeneratedSchema(child);
    Object.freeze(value);
  }
  return value;
};
export const contributionContractSchema = __freezeGeneratedSchema(JSON.parse("{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"$id\":\"urn:561:forge:contribution-contract:1\",\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"requirementId\",\"supportUrl\",\"verificationCommand\"],\"properties\":{\"requirementId\":{\"type\":\"string\",\"minLength\":1},\"supportUrl\":{\"type\":\"string\",\"format\":\"uri\"},\"verificationCommand\":{\"type\":\"string\",\"minLength\":1}}}"));
