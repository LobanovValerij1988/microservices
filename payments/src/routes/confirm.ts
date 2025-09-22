import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  EOrderStatus,
  BadRequestError,
  validationCredsHandler,
  NotFoundError,
} from "@ticketsproj/services";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";
import { OrderWaitingPaymentPublisher } from "../event/publishers/order-waiting-payment-publisher";
import mongoose from "mongoose";

const router = express.Router();

router.post(
  "/api/payments/confirm",
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
    if (order.status === EOrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }
    order.set({ status: EOrderStatus.AwaitingPayment });
    await order.save();
    new OrderWaitingPaymentPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
    });
    res.status(201).send({ status: "success" });
  }
);
export { router as createConfirmRouter };
