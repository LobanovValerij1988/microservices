import { TicketCreatedListener } from "../ticket-created-listener";
import { ITicketCreatedEvent } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const data: ITicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("create and save a ticket", async () => {
  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
