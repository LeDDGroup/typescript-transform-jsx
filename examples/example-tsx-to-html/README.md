# example-tsx-to-html

## Test

```sh
$ npm install
$ npm run build
$ cat dist/index.html
```

```tsx
// src/pages/index.tsx
import Layout from "../layout";

export default () => (
  <Layout title="Hello World">
    <h1>Hello World</h1>
  </Layout>
);
```

```html
<!-- dist/index.html -->
<html>
  <meta charset="UTF-8"></meta>
  <meta name="viewport" content="width=device-width initial-scale=1 shrink-to-fit=no"></meta>
  <head>
    <title>
      Hello World
    </title>
  </head>
  <body>
    <h1>
      Hello World
    </h1>
  </body>
</html>
```
