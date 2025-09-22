import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, EOrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("should return 404 when order is not found", async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set("Cookie", global.signup())
    .expect(404);
});

it("should return 401 when user tries to delete other users order", async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signup(userId2))
    .expect(401);
});

it("should delete the order successfully", async () => {
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
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signup(userId))
    .expect(204);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(EOrderStatus.Cancelled);
});

it("emit an order cancelled event", async () => {
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
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signup(userId))
    .expect(204);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
