declare global {
  namespace JSX {
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
}
interface Person {
  name: string;
  age: number;
}

export const App = (props: { persons: Person[] }) => (
  <ul>
    {props.persons.map(person => (
      <li>
        {person.name} is {person.age} years old
      </li>
    ))}
  </ul>
);
