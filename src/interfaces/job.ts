import { Document, Types } from "mongoose";

export interface Job extends Document {
  _id: Types.ObjectId;
  propery: string;
  type: string;
  fireTime: Date;
  processOwner: number;
}
