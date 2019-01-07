# typescript-transform-jsx

[![npm version](https://img.shields.io/npm/v/typescript-transform-jsx.svg)](https://www.npmjs.com/package/typescript-transform-jsx)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Built with Spacemacs](https://cdn.rawgit.com/syl20bnr/spacemacs/442d025779da2f62fc86c2082703697714db6514/assets/spacemacs-badge.svg)](http://spacemacs.org)

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

Add it to _plugins_ in your _tsconfig.json_

```json
{
  "compilerOptions": {
    "jsx": "react-native",
    "plugins": [{ "transform": "typescript-transform-jsx" }]
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
  `<ul>${props.persons
    .map(person => `<li>${person.name} is ${person.age} years old</li>`)
    .join("")}</ul>`;
```

## Roadmap/Caveats

- Using spread operators on html elements require _esnext_ environment because it compiles down to `Object.entries` expression:

```tsx
// input
const props = { class: "container" };
<div {...props} />;
// output
const props = { class: "container" };
`<div ${Object.entries(...props).map(
  ([key, value]) => `${key}="${value}"`
)}></div>`;
```

## Contributing

If you have any question or idea of a feature create an issue in github or make an PR.
