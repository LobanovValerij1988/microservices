import {
  ITicketCreatedEvent,
  Listener,
  ESubjects,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject = ESubjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
    const { title, price, id } = data;
    await Ticket.build({
      id,
      title,
      price,
    }).save();
    msg.ack();
  }
}
