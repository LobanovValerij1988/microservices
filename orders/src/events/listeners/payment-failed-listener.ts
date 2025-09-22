import {
  IPaymentFailedEvent,
  Listener,
  ESubjects,
  EOrderStatus,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentFailedListener extends Listener<IPaymentFailedEvent> {
  readonly subject = ESubjects.PaymentFailed;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IPaymentFailedEvent["data"], msg: Message) {
    const order = await Order.findById(data.id);

    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: EOrderStatus.Cancelled });
    await order.save();
    msg.ack();
  }
}
