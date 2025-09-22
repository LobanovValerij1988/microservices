import {
  Publisher,
  ESubjects,
  IOrderWaitingPaymentEvent,
} from "@ticketsproj/services";

export class OrderWaitingPaymentPublisher extends Publisher<IOrderWaitingPaymentEvent> {
  readonly subject = ESubjects.OrderWaitingPayment;
}
