import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { createIntentRouter } from "./routes/intent";
import { createConfirmRouter } from "./routes/confirm";
import { webHookRouter } from "./routes/webhook";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@ticketsproj/services";
import cookieSession from "cookie-session";
const app = express();
app.set("trust proxy", true); // because traffic is being proxied through ingress-nginx
app.use(
  cookieSession({
    signed: false,
    secure: false, // only through https if true
  })
);

app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    // skip json parser
    next();
  } else {
    json()(req, res, next);
  }
});

app.use(currentUser);
app.use(createIntentRouter);
app.use(createConfirmRouter);
app.use(webHookRouter);

app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
