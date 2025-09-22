import mongoose from "mongoose";
import { ITicketUpdatedEvent } from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 5,
  });
  await ticket.save();
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const data: ITicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};
it("update the ticket  and change the version number", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.id).toEqual(data.id);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has incorrect  version number", async () => {
  const { listener, data, msg, ticket } = await setup();
  data.version = 2;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  const notUpdatedTicket = await Ticket.findById(data.id);
  expect(notUpdatedTicket!.version).toEqual(ticket.version);
  expect(notUpdatedTicket!.price).toEqual(ticket.price);
  expect(notUpdatedTicket!.title).toEqual(ticket.title);
  expect(msg.ack).not.toHaveBeenCalled();
});
