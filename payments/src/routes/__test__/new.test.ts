import { EOrderStatus } from "@ticketsproj/services";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import request from "supertest";
import { app } from "../../app";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

jest.mock("../../stripe");

const setup = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    price: 20,
    status: EOrderStatus.Created,
    userId,
    version: 0,
  });
  await order.save();
  return { userId, orderId, order };
};

it("returns 400 when orderId is not provided", async () => {
  await request(app)
    .post("/api/payments/intent")
    .set("Cookie", global.signup())
    .send({})
    .expect(400);
});

it("returns 404 when order is not found", async () => {
  await request(app)
    .post("/api/payments/intent")
    .set("Cookie", global.signup())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when order does not belong to the user", async () => {
  const { orderId } = await setup();
  await request(app)
    .post("/api/payments/intent")
    .set("Cookie", global.signup())
    .send({
      orderId,
    })
    .expect(401);
});
