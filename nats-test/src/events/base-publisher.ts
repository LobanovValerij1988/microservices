import { Stan } from "node-nats-streaming";
import { ESubjects } from "./subjects";

interface IEvent {
  subject: ESubjects;
  data: any;
}

export abstract class Publisher<T extends IEvent> {
  abstract subject: T["subject"];
  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.publisher.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log("Event published to subject", this.subject);
        resolve();
      });
    });
  }
  private publisher: Stan;
  constructor(publisher: Stan) {
    this.publisher = publisher;
  }
}
