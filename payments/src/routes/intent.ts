import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validationCredsHandler,
  UnauthorizedError,
  NotFoundError,
} from "@ticketsproj/services";
import { stripe } from "../stripe";
import { Order } from "../models/order";
import mongoose from "mongoose";

const router = express.Router();

router.post(
  "/api/payments/intent",
  requireAuth,
  [
    body("orderId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("OrderId must be provided"),
  ],
  validationCredsHandler,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: order.price * 100,
      metadata: { orderId: order.id, userId: order.userId },
    });

    res.status(201).send({ clientSecret: paymentIntent.client_secret });
  }
);
export { router as createIntentRouter };
