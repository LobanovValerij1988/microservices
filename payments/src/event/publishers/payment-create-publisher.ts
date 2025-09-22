import {
  Publisher,
  ESubjects,
  IPaymentCreatedEvent,
} from "@ticketsproj/services";

export class PaymentCreatedPublisher extends Publisher<IPaymentCreatedEvent> {
  readonly subject = ESubjects.PaymentCreated;
}
