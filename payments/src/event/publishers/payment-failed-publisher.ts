import {
  Publisher,
  ESubjects,
  IPaymentFailedEvent,
} from "@ticketsproj/services";

export class PaymentFailedPublisher extends Publisher<IPaymentFailedEvent> {
  readonly subject = ESubjects.PaymentFailed;
}
