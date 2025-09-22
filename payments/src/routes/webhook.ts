import express, { Request, Response } from "express";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../event/publishers/payment-create-publisher";
import { natsWrapper } from "../nats-wrapper";
import { PaymentFailedPublisher } from "../event/publishers/payment-failed-publisher";
import { Order } from "../models/order";
import { EOrderStatus, NotFoundError } from "@ticketsproj/services";

const router = express.Router();

router.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      throw new Error("No Stripe signature found");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEB_HOOK_KEY!
      );
    } catch (err) {
      throw new Error("Stripe webhook error: " + (err as Error).message);
    }
    // handle event
    console.log("Stripe event:", event!.type);
    switch (event!.type) {
      case "payment_intent.succeeded":
        console.log(event.data.object);
        const payment = Payment.build({
          orderId: event.data.object.metadata.orderId,
          stripeId: event.id,
        });
        await payment.save();
        new PaymentCreatedPublisher(natsWrapper.client).publish({
          id: payment.id,
          orderId: payment.orderId,
          stripeId: payment.stripeId,
        });
        break;
      case "payment_intent.payment_failed":
        const order = await Order.findById(event.data.object.metadata.orderId);
        if (!order) {
          throw new NotFoundError();
        }
        order.set({ status: EOrderStatus.Cancelled });
        await order.save();
        new PaymentFailedPublisher(natsWrapper.client).publish({
          id: order.id,
          version: order.version,
        });
        break;
      // handle other event types...
      default:
        console.log(`Unhandled event type ${event!.type}`);
    }

    res.json({ received: true });
  }
);
export { router as webHookRouter };
