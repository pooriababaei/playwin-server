import { Document, Types } from 'mongoose';

export interface Box extends Document {
  _id: Types.ObjectId;
  type: number;
  price: number;
  offPrice: number;
  coupon: number;
  endTime: Date;
}
