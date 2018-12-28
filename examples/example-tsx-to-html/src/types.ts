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
