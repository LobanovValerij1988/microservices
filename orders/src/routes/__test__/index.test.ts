import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, EOrderStatus } from "../../models/order";
it("should fetch orders for the perticular user", async () => {
  const userId1 = new mongoose.Types.ObjectId().toHexString();
  const userId2 = new mongoose.Types.ObjectId().toHexString();
  const ticketUser1 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  const ticketUser2 = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert2",
    price: 30,
  });

  await ticketUser1.save();
  await ticketUser2.save();
  const order1 = Order.build({
    userId: userId2,
    status: EOrderStatus.Created,
    ticket: ticketUser2,
    expiresAt: new Date(),
  });
  await order1.save();
  const order2 = Order.build({
    userId: userId1,
    status: EOrderStatus.Created,
    ticket: ticketUser1,
    expiresAt: new Date(),
  });
  await order2.save();
  const order3 = Order.build({
    userId: userId1,
    status: EOrderStatus.Cancelled,
    ticket: ticketUser1,
    expiresAt: new Date(),
  });
  await order3.save();
  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", global.signup(userId1))
    .expect(200);
  expect(res.body.length).toEqual(2);
  expect(res.body[0].id).toEqual(order2.id);
  expect(res.body[0].userId).toEqual(userId1);
  expect(res.body[1].id).toEqual(order3.id);
  expect(res.body[0].ticket.id).toEqual(ticketUser1.id);
});
