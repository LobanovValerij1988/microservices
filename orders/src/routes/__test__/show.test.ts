import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, EOrderStatus } from "../../models/order";
import mongoose from "mongoose";

it("should return 404 when order is not found", async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", global.signup())
    .expect(404);
});

it("should return 401 when one user tries to fetch another user's order", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some title",
    price: 20,
  });
  await ticket.save();
  const userId1 = new mongoose.Types.ObjectId().toHexString();
  const userId2 = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    userId: userId1,
    status: EOrderStatus.Created,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signup(userId2))
    .expect(401);
});

it("should fetch the order successfully", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "some title",
    price: 20,
  });
  await ticket.save();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    userId,
    status: EOrderStatus.Created,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();
  const res = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signup(userId))
    .expect(200);
  expect(res.body.id).toEqual(order.id);
  expect(res.body.ticket.id).toEqual(ticket.id);
  expect(res.body.userId).toEqual(userId);
});
