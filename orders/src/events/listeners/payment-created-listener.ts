import {
  IPaymentCreatedEvent,
  Listener,
  ESubjects,
  EOrderStatus,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<IPaymentCreatedEvent> {
  readonly subject = ESubjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IPaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: EOrderStatus.Complete });
    await order.save();
    msg.ack();
  }
}
