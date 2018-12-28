export default (props: { title: string; children?: any }) => (
  <html>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width initial-scale=1 shrink-to-fit=no"
    />
    <head>
      <title>{props.title}</title>
    </head>
    <body>{props.children}</body>
  </html>
);
