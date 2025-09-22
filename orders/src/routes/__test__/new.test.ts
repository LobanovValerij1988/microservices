import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("should fail when ticket doesn't exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: ticketId,
    })
    .expect(404);
});

it("create an order successfully", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some title",
    price: 20,
  });
  await ticket.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it("should fail when ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some title",
    price: 20,
  });
  await ticket.save();
  // create an order first
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  // try to create another order
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("emit an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some title",
    price: 20,
  });
  await ticket.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
