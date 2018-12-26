import * as ts from "typescript";
import transformer from "./index";

describe("transformer", () => {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2016,
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
\`<div className=\${className} secondProp=\${123}>Hello World</div>\`;
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
\`<div className=\${className} secondProp=\${123}>\${content}</div>\`;
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
\`<div secondProp="hello"><a className=\${className}>\${content}</a></div>\`;
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
\`<input type=\${type}></input>\`;
`
    );
  });

  it("should convert elements iniside functions", () => {
    test(
      `\
interface Person {
name: string;
type: "programmer" | "user";
}

const App = (props: { persons: Person[] }) => (
  <ul>
    {props.persons.map(person => (
      <li>
        {person.name} is a {person.type} hello
      </li>
    ))}
  </ul>
);
`,
      `\
const App = (props) => (\`<ul>\${props.persons.map(person => (\`<li>\${person.name} is a \${person.type} hello</li>\`))}</ul>\`);
`
    );
  });
});
