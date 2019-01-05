import * as ts from "typescript";
import { readFileSync } from "fs";
import { resolve } from "path";
import transformer from "./index";

describe("transformer", () => {
  it("should compile", () => {
    const inputFile = resolve(__dirname, "__fixtures/input.tsx");
    const expectedFile = resolve(__dirname, "__fixtures/expected.js");
    const result = compile(inputFile, compilerOptions);
    const expected = readFileSync(expectedFile).toString();
    expect(result).toBe(expected);
  });
});

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.Preserve
};

function compile(file: string, options: ts.CompilerOptions): string {
  let content = "";
  const program = ts.createProgram([file], options);
  program.emit(
    undefined,
    (_, result) => (content = result),
    undefined,
    undefined,
    {
      after: [transformer(program)]
    }
  );
  return content;
}
