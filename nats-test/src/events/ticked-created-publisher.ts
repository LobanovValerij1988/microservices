import { ITicketCreatedEvent } from "./ticket-created-event";
import { ESubjects } from "./subjects";
import { Publisher } from "./base-publisher";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  readonly subject = ESubjects.TicketCreated;
}
