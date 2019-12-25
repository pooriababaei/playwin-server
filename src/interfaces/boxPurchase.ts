import { Document, Types } from "mongoose";

export interface BoxPurchase extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  authority: string;
  amount: number;
  refId: string;
}
