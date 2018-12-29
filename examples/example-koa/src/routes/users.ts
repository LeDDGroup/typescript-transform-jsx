import { Context } from "koa";
import ViewUsers from "../views/users";
import ViewUserDetails from "../views/user-details";

const users = [
  {
    id: "57fa5d67-e926-4519-ac0d-7abf5a18e368",
    name: "Robert"
  },
  {
    id: "4f9d4e2e-6e45-472b-b0e4-1196dd722ff1",
    name: "Berta"
  }
];

export function index(ctx: Context) {
  ctx.body = ViewUsers({ users });
}

export function byId(ctx: import("koa").Context) {
  const user = users.filter(({ id }) => id === ctx.params.id)[0];
  ctx.body = ViewUserDetails({ user });
}
