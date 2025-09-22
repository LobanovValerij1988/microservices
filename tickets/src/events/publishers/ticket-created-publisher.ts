import {
  Publisher,
  ESubjects,
  ITicketCreatedEvent,
} from "@ticketsproj/services";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  readonly subject = ESubjects.TicketCreated;
}
