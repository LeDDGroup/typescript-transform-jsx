import * as ts from "typescript";
import transformer from "./index";

describe("transformer", () => {
  const compilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.Preserve
  };

  function test(source: string, expected: string) {
    let result = ts.transpileModule(source, {
      transformers: {
        before: [transformer]
      },
      compilerOptions
    });

    expect(result.outputText).toBe(expected);
  }

  it("should convert to string", () => {
    test(
      `\
<div className="container" moreProps="hello">Hello World</div>;
`,
      `\
"<div className=\\"container\\" moreProps=\\"hello\\">Hello World</div>";
`
    );
  });

  it("should convert to template literal", () => {
    test(
      `\
const className = "container";
<div className={className} secondProp={123}>Hello World</div>;
`,
      `\
const className = "container";
\`<div className="\${className}" secondProp="\${123}">Hello World</div>\`;
`
    );
  });

  it("should convert to template literal if expression in children", () => {
    test(
      `\
const className = "container";
const content = "Hello World";
<div className={className} secondProp={123}>{content}</div>;
`,
      `\
const className = "container";
const content = "Hello World";
\`<div className="\${className}" secondProp="\${123}">\${content}</div>\`;
`
    );
  });

  it("should convert nested", () => {
    test(
      `\
const className = "container";
const content = "Hello World";
<div secondProp="hello"><a className={className}>{content}</a></div>;
`,
      `\
const className = "container";
const content = "Hello World";
\`<div secondProp="hello"><a className="\${className}">\${content}</a></div>\`;
`
    );
  });

  it("should convert fragment", () => {
    test(
      `\
<><h1>hello</h1></>;
`,
      `\
"<h1>hello</h1>";
`
    );
  });

  it("should convert self closing element", () => {
    test(
      `\
const type = "number";
<input type={type} />;
`,
      `\
const type = "number";
\`<input type="\${type}"></input>\`;
`
    );
  });

  it("should convert elements iniside functions", () => {
    test(
      `\
interface Person {
name: string;
age: number;
}

const App = (props: { persons: Person[] }) => (
  <ul>
    {props.persons.map(person => (
      <li>
        {person.name} is {person.age} years old
      </li>
    ))}
  </ul>
);
`,
      `\
const App = (props) => (\`<ul>\${props.persons.map(person => (\`<li>\${person.name} is \${person.age} years old</li>\`))}</ul>\`);
`
    );
  });

  it("should convert function components", () => {
    test(
      `\
function LabeledInput(props: { type: string, children: string }) { return (<div><label>{props.children}</label><input type={type} /></div>); }
const name = "world";
<LabeledInput type="number">Hello <h1>{name}</h1></LabeledInput>;
`,
      `\
function LabeledInput(props) { return (\`<div><label>\${props.children}</label><input type="\${type}"></input></div>\`); }
const name = "world";
LabeledInput({ type: "number", children: \`Hello <h1>\${name}</h1>\` });
`
    );
  });

  it("should convert self closing function elements", () => {
    test(
      `\
function LabeledInput(props: { type: string }) { return (<input type={type} />); }
const type = "number";
<LabeledInput type={type}/>;
`,
      `\
function LabeledInput(props) { return (\`<input type="\${type}"></input>\`); }
const type = "number";
LabeledInput({ type: type });
`
    );
  });

  it("should allow spread expressions in function elements", () => {
    test(
      `\
const options = { class: "container" };
const App = (props) => <div class={props.class}></div>;
<App {...options}></App>;
`,
      `\
const options = { class: "container" };
const App = (props) => \`<div class="\${props.class}"></div>\`;
App({ ...options, children: "" });
`
    );
  });
});
