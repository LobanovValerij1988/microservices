import {
  Listener,
  ESubjects,
  EOrderStatus,
  IOrderWaitingPaymentEvent,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderWaitingPaymentListener extends Listener<IOrderWaitingPaymentEvent> {
  readonly subject = ESubjects.OrderWaitingPayment;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IOrderWaitingPaymentEvent["data"], msg: Message) {
    console.log("OrderWaitingPaymentListener data:", data);
    const orders = await Order.find({});
    console.log("All orders:", orders);
    const order = await Order.findById(data.id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: EOrderStatus.AwaitingPayment });
    await order.save();
    msg.ack();
  }
}
