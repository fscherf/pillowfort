// This hack is necessary to fix this typscript error:
//
//   node_modules/parse5/dist/tokenizer/index.d.ts:3:31 - error TS7016: Could not find a declaration file for module 'entities/decode'. '/app/frontend/node_modules/entities/decode.js' implicitly hasan 'any' type.
//     There are types at '/app/frontend/node_modules/entities/dist/esm/decode.d.ts', but this result could not be resolved under your current 'moduleResolution' setting. Consider updating to 'node16', 'nodenext', or 'bundler'.
declare module "entities/decode" {
  export * from "entities/dist/esm/decode";
}
