import { Document, Types } from 'mongoose';

export interface WeeklyReward extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reward: number;
  createdAt: Date;
}
