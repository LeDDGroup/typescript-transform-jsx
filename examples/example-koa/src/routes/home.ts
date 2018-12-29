import { Context } from "koa";
import ViewHome from "../views/home";

export default function Home(ctx: Context) {
  ctx.body = ViewHome();
}
