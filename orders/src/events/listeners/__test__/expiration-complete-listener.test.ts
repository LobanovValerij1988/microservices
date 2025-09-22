import mongoose from "mongoose";
import { IExpirationCompleteEvent, EOrderStatus } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 5,
  });
  await ticket.save();
  const order = Order.build({
    status: EOrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const expirationlistener = new ExpirationCompleteListener(natsWrapper.client);
  const data: IExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { expirationlistener, data, msg, ticket, order };
};

it("update the order status to cancelled when order is expired", async () => {
  const { expirationlistener, data, msg } = await setup();
  await expirationlistener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.orderId);
  expect(updatedOrder!.status).toEqual(EOrderStatus.Cancelled);
  expect(msg.ack).toHaveBeenCalled();
});

it("emit an OrderCancelled event", async () => {
  const { expirationlistener, data, msg, order } = await setup();
  await expirationlistener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});
