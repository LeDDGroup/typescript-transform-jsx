import Base from "./layout";
import routes from "../routes";

export default (props: { user: { id: string; name: string } }) => (
  <Base title="User Details" active="users">
    <table>
      <tr>
        <td>Id: </td>
        <td>{props.user.id}</td>
      </tr>
      <tr>
        <td>Name: </td>
        <td>{props.user.name}</td>
      </tr>
    </table>
  </Base>
);
