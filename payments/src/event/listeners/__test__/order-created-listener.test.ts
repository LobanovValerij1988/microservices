import mongoose from "mongoose";
import { EOrderStatus, IOrderCreatedEvent } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";

const setUp = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: IOrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: new Date().toISOString(),
    status: EOrderStatus.Created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("save order info", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order!).toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(order!.status).toEqual(EOrderStatus.Created);
});
