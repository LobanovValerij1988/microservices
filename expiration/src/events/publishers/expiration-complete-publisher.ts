import {
  Publisher,
  ESubjects,
  IExpirationCompleteEvent,
} from "@ticketsproj/services";

export class ExpirationCompletePublisher extends Publisher<IExpirationCompleteEvent> {
  readonly subject = ESubjects.ExpirationComplete;
}
