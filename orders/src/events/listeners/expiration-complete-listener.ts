import {
  Listener,
  ESubjects,
  IExpirationCompleteEvent,
  EOrderStatus,
} from "@ticketsproj/services";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../../events/publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<IExpirationCompleteEvent> {
  readonly subject = ESubjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: IExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status === EOrderStatus.AwaitingPayment) {
      return;
    }
    if (order.status !== EOrderStatus.Complete) {
      order.set({ status: EOrderStatus.Cancelled });
      await order.save();
      await new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        ticket: { id: order.ticket.id },
        version: order.version,
      });
    }

    msg.ack();
  }
}
