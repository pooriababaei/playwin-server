import { Document, Types } from 'mongoose';

export interface PublisherLeague extends Document {
  _id: Types.ObjectId;
  game: Types.ObjectId;
  collectionName: string;
  description: string;
  leadersNumber: number;
  reward: number;
  rewarded: boolean;
  defaultOpportunity: number;
  maxOpportunity: number;
  startTime: Date;
  endTime: Date;
  available: boolean;
  playersNumber?: number;
  leadersAveragePlayedTimes?: number;
}
