import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { ITicketCreatedEvent } from "./ticket-created-event";
import { ESubjects } from "./subjects";

export class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  readonly subject = ESubjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);
    msg.ack();
  }
}
