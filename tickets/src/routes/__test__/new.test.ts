import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/tickets";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns the status is other than 401 if user is signin", async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns am error if invalid title is provided  ", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      price: 10,
    })
    .expect(400);
});
it(" returns an error if invalid price is provided  ", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "some title",
    })
    .expect(400);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "some title",
      price: -10,
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  const ticketsBefore = await Ticket.find({});
  expect(ticketsBefore.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title: "some title",
      price: 20,
    })
    .expect(201);
  const ticketsAfter = await Ticket.find({});
  expect(ticketsAfter.length).toEqual(1);
  expect(ticketsAfter[0].price).toEqual(20);
  expect(ticketsAfter[0].title).toEqual("some title");
});

it("publishes an event", async () => {
  const title = "some title";
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({
      title,
      price: 20,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
