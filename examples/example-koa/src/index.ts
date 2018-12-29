import Koa = require("koa");
import Router = require("koa-router");
import Home from "./routes/home";
import * as Users from "./routes/users";
import routes from "./routes";

const app = new Koa();
const router = new Router();

router.get(routes.home(), Home);
router.get(routes.user.index(), Users.index);
router.get(routes.user.byId(":id"), Users.byId);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log("Server listening at http://localhost:3000");
