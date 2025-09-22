import {
  Listener,
  ESubjects,
  IOrderCreatedEvent,
  EOrderStatus,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<IOrderCreatedEvent> {
  readonly subject = ESubjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: EOrderStatus.Created,
      price: data.ticket.price,
      userId: data.userId,
      version: data.version,
    });
    await order.save();
    msg.ack();
  }
}
