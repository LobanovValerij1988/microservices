import mongoose from "mongoose";
import { EOrderStatus } from "@ticketsproj/services";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { ITicketDoc } from "./ticket";

export { EOrderStatus };
// An interface that describes the properties
// that are required to create a new Order
interface IOrderAttrs {
  userId: string;
  status: EOrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
}
// An interface that describes the properties
// that an Order Document has
interface IOrderDoc extends mongoose.Document {
  userId: string;
  status: EOrderStatus;
  expiresAt: Date;
  version: number;
  ticket: ITicketDoc;
}
// An interface that describes the properties
// that an Order Model has
interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(EOrderStatus),
      default: EOrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: IOrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<IOrderDoc, IOrderModel>("Order", orderSchema);

export { Order };
