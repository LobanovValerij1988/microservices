import { IOrderCreatedEvent, Listener, ESubjects } from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  readonly subject = ESubjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    await expirationQueue.add(
      { orderId: data.id },
      { delay: new Date(data.expiresAt).getTime() - new Date().getTime() }
    );

    msg.ack();
  }
}
