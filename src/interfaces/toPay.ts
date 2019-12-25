import { Document, Types } from "mongoose";

export interface ToPay extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  paid: boolean;
  payTime: Date;
  paymentNumber: number;
}
