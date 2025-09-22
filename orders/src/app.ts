import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@ticketsproj/services";
import cookieSession from "cookie-session";
import { indexOrderRouter } from "./routes/index";
import { showOrderRouter } from "./routes/show";
import { newOrderRouter } from "./routes/new";
import { deleteOrderRouter } from "./routes/delete";
const app = express();
app.set("trust proxy", true); // because traffic is being proxied through ingress-nginx
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, // only through https if true
  })
);
app.use(currentUser);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
