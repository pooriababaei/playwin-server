import { Document, Types } from 'mongoose';

export interface Scoreboard extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  score: number;
  opportunity: number;
  played: number;
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
}
