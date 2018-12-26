# typescript-transform-jsx

[![npm version](https://img.shields.io/npm/v/typescript-transform-jsx.svg)](https://www.npmjs.com/package/typescript-transform-jsx)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Typescript transform jsx to string

## Motivation

- Typesafe templates
- Transform jsx to string in compilation time
- Fast runtime

## Install

```sh
$ npm i -D typescript-transform-jsx
```

## Usage with [ttypescript](https://github.com/cevek/ttypescript/)

Add it to _plugin_ in your _tsconfig.json_

```json
{
  "compilerOptions": {
    "jsx": "react-native",
    "plugins": [{ "transform": "typescript-transform-jsx", "type": "raw" }]
  }
}
```

See https://github.com/danielpa9708/test-typescript-transform-jsx

## Setup

Set the `jsx` flag to `react-native` or `preserve` in your _tsconfig_ file. Then create a `types.ts` with the following content:

```ts
declare namespace JSX {
  type Element = string;
  interface IntrinsicElements {
    [element: string]: {
      [property: string]: any;
    };
  }
}
```

This will declare custom JSX so you don't need react typings.

## Example

```tsx
// app.tsx
interface Person {
  name: string;
  type: "programmer" | "user";
}

const App = (props: { persons: Person[] }) => (
  <ul>
    {props.persons.map(person => (
      <li>
        {person.name} is a {person.type}
      </li>
    ))}
  </ul>
);
```

Gets compiled to:

```js
// app.js
const App = props =>
  `<ul>${props.persons.map(
    person => `<li>${person.name} is a ${person.type}</li>`
  )}</ul>`;
```

## Roadmap/Caveats

- Support nested components, eg this wont work:

```tsx
function LabeledInput(props: { label: string }) {
  return (
    <div>
      <label>{props.label}</label>
      <input />
    </div>
  );
}

function App() {
  return <LabeledInput label="hello" />;
}
```

## Contributing

If you have any question or idea of a feature create an issue in github or make an PR.
