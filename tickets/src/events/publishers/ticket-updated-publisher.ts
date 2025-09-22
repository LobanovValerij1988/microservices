import {
  Publisher,
  ESubjects,
  ITicketUpdatedEvent,
} from "@ticketsproj/services";

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
  readonly subject = ESubjects.TicketUpdated;
}
