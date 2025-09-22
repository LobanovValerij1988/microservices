import { Ticket } from "../../../models/tickets";
import { OrderCreatedListener } from "../order-created-listeners";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { EOrderStatus, IOrderCreatedEvent } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";

const setUp = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: IOrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: EOrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it("sets the orderId of the ticket", async () => {
  const { listener, data, ticket, msg } = await setUp();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, ticket, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const publishedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(publishedData.id).toEqual(ticket.id);
  expect(publishedData.price).toEqual(ticket.price);
});
