import { Listener, ESubjects, IOrderCreatedEvent } from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { Ticket } from "../../models/tickets";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  readonly subject = ESubjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const ticketToUpdate = await Ticket.findById(data.ticket.id);
    if (!ticketToUpdate) {
      throw new Error("Ticket not found");
    }

    ticketToUpdate.set({ orderId: data.id });
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
