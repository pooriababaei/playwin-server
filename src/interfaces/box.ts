import { Document, Types } from "mongoose";

export interface Box extends Document {
  type: number;
  price: number;
  offPrice: number;
  coupon: number;
  endTime: Date;
}
