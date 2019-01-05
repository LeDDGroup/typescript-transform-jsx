# example-ttypescript

## Test

```sh
$ npm install
$ npm run build
$ cat src/home.js
```

```tsx
// src/home.tsx
export const App = (props: { persons: Person[] }) => (
  <ul>
    {props.persons.map(person => (
      <li>
        {person.name} is {person.age} years old
      </li>
    ))}
  </ul>
);
```

```js
// src/home.js
exports.App = props =>
  `<ul>${props.persons
    .map(person => `<li>${person.name} is ${person.age} years old</li>`)
    .join("")}</ul>`;
```
