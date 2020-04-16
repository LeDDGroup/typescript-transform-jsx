import * as ts from "typescript";
import transformer from "./index";
import safeEval from "safe-eval";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.Preserve,
};

function compile(source: string) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    transformers: { after: [transformer] },
  });
  return outputText;
}

function runFunction(source: string) {
  const compiled = compile(source);
  const wrapped = `(function () {${compiled}})()`;
  return safeEval(wrapped);
}

function run(source: string) {
  return safeEval(compile(source));
}

function checkf(source: string, expected: string) {
  const actual = runFunction(source);
  expect(actual).toBe(expected);
}

function check(source: string, expected: string) {
  const actual = run(source);
  expect(actual).toBe(expected);
}

test("simple", () => {
  check(
    '<div className="container" moreProps="hello">Hello World</div>;',
    '<div className="container" moreProps="hello">Hello World</div>'
  );
});

test("interpolation", () => {
  check('<div class={3}>{"hello"}</div>', '<div class="3">hello</div>');
});

test("fragments", () => {
  check("<><h1>hello</h1><h2>world</h2></>", "<h1>hello</h1><h2>world</h2>");
});

test("More Complex", () => {
  checkf(
    `
const Control = ({label, children}: any) => <div><label>{label}</label>{children}</div>
return <Control label='hello'>world</Control>;
`,
    "<div><label>hello</label>world</div>"
  );
});

test("spread", () => {
  checkf(
    `
const Control = ({label, children}: any) => <div><label>{label}</label>{children}</div>
return <Control {...{ label: "hello", children: "world" }} />;
`,
    "<div><label>hello</label>world</div>"
  );
});

test("spread2", () => {
  checkf(
    `
const Control = ({children, label, ...props}: any) => <label>{label}<a {...props}/></label>
return <Control label='hello' placeholder='world' type='string' />;
`,
    '<label>hello<a placeholder="world" type="string"/></label>'
  );
});

test("spread3", () => {
  checkf(
    `
const Input = ({ children, ...props }: any) => (
  <div class="uk-width-small-1-2 uk-margin-bottom"><input class="uk-width-1-1 uk-text-contrast form_input" {...props} /></div>
);
return <Input type="text" placeholder="First Name*" name="First Name" required/>
`,
    '<div class="uk-width-small-1-2 uk-margin-bottom"><input class="uk-width-1-1 uk-text-contrast form_input" type="text" placeholder="First Name*" name="First Name" required="true"/></div>'
  );
});

test("whitespace between tags", () => {
  check(
    `
<h2>
hello
<span>world</span>
</h2>
`,
    "<h2>hello<span>world</span></h2>"
  );
});
// https://reactjs.org/docs/jsx-in-depth.html#string-literals-1
