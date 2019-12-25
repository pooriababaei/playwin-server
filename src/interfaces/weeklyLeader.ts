import { Document, Types } from "mongoose";

export interface WeeklyLeader extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reward: number;
  createdAt: Date;
}
