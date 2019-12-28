import { Document, Types } from 'mongoose';

export interface Auth extends Document {
  _id: Types.ObjectId;
  phoneNumber: string;
  authToken: number;
  createAt: Date;
}
