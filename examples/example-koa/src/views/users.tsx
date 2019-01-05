import Base from "./layout";
import routes from "../routes";

export default (props: { users: { id: string; name: string }[] }) => (
  <Base title="User List" active="users">
    <h1>Users</h1>
    <ul>
      {props.users.map(({ id, name }) => (
        <li>
          <a href={routes.user.byId(id)}>{name}</a>
        </li>
      ))}
    </ul>
  </Base>
);
