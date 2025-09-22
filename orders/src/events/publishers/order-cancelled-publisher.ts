import {
  Publisher,
  ESubjects,
  IOrderCancelledEvent,
} from "@ticketsproj/services";

export class OrderCancelledPublisher extends Publisher<IOrderCancelledEvent> {
  readonly subject = ESubjects.OrderCancelled;
}
