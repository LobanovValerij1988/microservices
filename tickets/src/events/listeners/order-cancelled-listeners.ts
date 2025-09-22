import {
  Listener,
  ESubjects,
  IOrderCancelledEvent,
} from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { Ticket } from "../../models/tickets";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  readonly subject = ESubjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const ticketToUpdate = await Ticket.findById(data.ticket.id);
    if (!ticketToUpdate) {
      throw new Error("Ticket not found");
    }

    ticketToUpdate.set({ orderId: undefined });
    await ticketToUpdate.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticketToUpdate.id,
      title: ticketToUpdate.title,
      price: ticketToUpdate.price,
      userId: ticketToUpdate.userId,
      version: ticketToUpdate.version,
      orderId: ticketToUpdate.orderId,
    });
    msg.ack();
  }
}
