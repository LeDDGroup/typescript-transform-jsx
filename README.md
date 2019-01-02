# typescript-transform-jsx

[![npm version](https://img.shields.io/npm/v/typescript-transform-jsx.svg)](https://www.npmjs.com/package/typescript-transform-jsx)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Typescript transform jsx to string

**Table of Contents**

- [typescript-transform-jsx](#typescript-transform-jsx)
  - [Motivation](#motivation)
  - [Install](#install)
  - [Usage with ttypescript](#usage-with-ttypescripthttpsgithubcomcevekttypescript)
  - [Setup](#setup)
  - [Example](#example)
  - [Roadmap/Caveats](#roadmapcaveats)
  - [Contributing](#contributing)

## Motivation

- Typesafe templates
- Transform jsx to string in compilation time
- Fast runtime

See [examples](https://github.com/LeDDGroup/typescript-transform-jsx/tree/master/examples)

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

See https://github.com/LeDDGroup/typescript-transform-jsx/tree/master/examples/example-ttypescript

## Setup

Set the `jsx` flag to `react-native` or `preserve` in your _tsconfig_ file. Then create a `types.ts` with the following content:

```ts
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
```

This will declare custom JSX so you don't need react typings.

## Example

```tsx
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
```

Gets compiled to:

```js
const App = props =>
  `<ul>${props.persons.map(
    person => `<li>${person.name} is ${person.age} years old</li>`
  )}</ul>`;
```

## Roadmap/Caveats

- `.map` constructions needs to be converted to string manually, otherwise elements will be joined with a comma, as a workaround explicitly join the array:

```tsx
// Bad
const arr = ["hello", "world"];
const App = () => (
  <div>
    {arr.map(msg => (
      <h1>{msg}</h1>
    ))}
  </div>
);

// Workaround
const arr = ["hello", "world"];
const App = () => <div>{arr.map(msg => <h1>{msg}</h1>).join("")}</div>;
```

- Spread operators are not working in native elements:

```tsx
const Pass = props => <div {...props} />; // ok: spread operators on "div" element doesn't work
const App = props => <Pass {...props} />; // bad: spread operators on function elements does work
```

## Contributing

If you have any question or idea of a feature create an issue in github or make an PR.
