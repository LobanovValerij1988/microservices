import mongoose from "mongoose";
import { IOrderCancelledEvent } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/tickets";
import { OrderCancelledListener } from "../order-cancelled-listeners";
import { natsWrapper } from "../../../nats-wrapper";

const setUp = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();
  const listener = new OrderCancelledListener(natsWrapper.client);

  const data: IOrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version,
    ticket: {
      id: ticket.id,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it("updates ticket", async () => {
  const { listener, data, ticket, msg } = await setUp();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
