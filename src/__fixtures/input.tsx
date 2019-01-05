declare namespace JSX {
  type Element = string;
  interface ElementChildrenAttribute {
    children: any;
  }
  interface IntrinsicElements {
    [element: string]: {
      [property: string]: any;
    };
  }
}

// should be just a string
<div className="container" moreProps="hello">
  Hello World
</div>;
// should use string templates
<div class={3}>{"Hello World"}</div>;
// fragment
<>
  <h1>hello</h1>
</>;
<>hello</>;
// complex
function Control(props: { label: string; children: any }) {
  return (
    <div>
      <label>props.label</label>
      {props.children}
    </div>
  );
}
<Control label="hello">{[1, 2, 3].map(el => <p>{el}</p>).join("")}</Control>;
<Control label="world">
  <h1>Hello</h1>
</Control>;
<Control {...{ label: "hello", children: "world" }} />;
// array
<ul>{[1, 2, 3].map((el) => <li>{el}</li>)}</ul>;
