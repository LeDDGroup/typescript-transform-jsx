// should be just a string
"<div className=\"container\" moreProps=\"hello\">Hello World\n</div>";
// should use string templates
`<div class="${3}">${"Hello World"}</div>`;
// fragment
"<h1>hello</h1>";
"hello";
// complex
function Control(props) {
    return (`<div><label>props.label</label>${props.children}</div>`);
}
Control({ label: "hello", children: [1, 2, 3].map(el => `<p>${el}</p>`).join("") });
Control({ label: "world", children: "<h1>Hello</h1>" });
Control({ ...{ label: "hello", children: "world" }, children: "" });
// array
`<ul>${[1, 2, 3].map((el) => `<li>${el}</li>`).join("")}</ul>`;
// spread operators on html elements
`<div ${Object.entries(...{ class: "container" }).map(([key, value]) => `${key}="${value}"`)}></div>`;
