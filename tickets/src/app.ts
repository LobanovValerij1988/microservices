import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@ticketsproj/services";
import cookieSession from "cookie-session";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";
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
app.use(indexTicketRouter);
app.use(showTicketRouter);
app.use(createTicketRouter);
app.use(updateTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
