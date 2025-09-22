import {
  Publisher,
  ESubjects,
  IOrderCreatedEvent,
} from "@ticketsproj/services";

export class OrderCreatedPublisher extends Publisher<IOrderCreatedEvent> {
  readonly subject = ESubjects.OrderCreated;
}
