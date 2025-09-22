import {
  Listener,
  ESubjects,
  IOrderCancelledEvent,
  EOrderStatus,
} from "@ticketsproj/services";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<IOrderCancelledEvent> {
  readonly subject = ESubjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: EOrderStatus.Cancelled });
    await order.save();
    msg.ack();
  }
}
