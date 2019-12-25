import { Document, Types } from "mongoose";

export interface Achievement extends Document {
  _id: Types.ObjectId;
  type: string;
  level: number;
  threshold: number;
  rewardType: string;
  reward: number;
}
