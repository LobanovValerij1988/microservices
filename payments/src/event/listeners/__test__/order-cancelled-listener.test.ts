import mongoose from "mongoose";
import { EOrderStatus } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { IOrderCancelledEvent } from "@ticketsproj/services";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: EOrderStatus.Created,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const data: IOrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };
  return { listener, data, msg };
};

it("updates status of the order to cancelled", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(msg.ack).toHaveBeenCalled();
  expect(order!.status).toEqual(EOrderStatus.Cancelled);
});
