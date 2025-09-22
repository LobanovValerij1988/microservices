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
    .post("/api/payments")
    .set("Cookie", global.signup())
    .send({})
    .expect(400);
});

it("returns 404 when order is not found", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signup())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when order does not belong to the user", async () => {
  const { orderId } = await setup();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signup())
    .send({
      orderId,
    })
    .expect(401);
});

it("returns 400 when order has status cancelled", async () => {
  const { orderId, userId } = await setup();
  const order = await Order.findById(orderId);
  order!.set({ status: EOrderStatus.Cancelled });
  await order!.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signup(userId))
    .send({
      orderId,
    })
    .expect(400);
});
it("returns 201 with valid inputs", async () => {
  const { orderId, userId, order } = await setup();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signup(userId))
    .send({
      orderId,
    })
    .expect(201);
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual("usd");
});

it("creates a payment record with valid inputs", async () => {
  const { orderId, userId } = await setup();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signup(userId))
    .send({
      orderId,
    })
    .expect(201);
  const payment = await Payment.findOne({
    orderId,
  });
  expect(payment).not.toBeNull();
  expect(payment!.stripeId).toBeDefined();
});
