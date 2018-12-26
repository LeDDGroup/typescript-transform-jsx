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

See [typescript-jsx-to-string](https://github.com/LeDDGroup/typescript-jsx-to-string) or [ttypescript](https://github.com/cevek/ttypescript/) to use this package

## Usage

Set the `jsx` flag to `preserve` in your _tsconfig_ file. Then create a `types.ts` with the following content:

```ts
declare namespace JSX {
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
// home.tsx
export default function Home(props: { name: string }) {
  return <h1>Hello {props.name}</h1>;
}
```

Gets compiled to:

```js
// home.js
exports.default = function Home(props) {
  return `<h1>Hello ${props.name}</h1>`;
};
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
