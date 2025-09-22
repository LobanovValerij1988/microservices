import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { errorHandler, NotFoundError } from "@ticketsproj/services";
import cookieSession from "cookie-session";
const app = express();
app.set("trust proxy", true); // because traffic is being proxied through ingress-nginx
app.use(json());
console.log(process.env.NODE_ENV, "NODE_ENV");
app.use(
  cookieSession({
    signed: false,
    secure: false, // only through https if true
  })
);

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
