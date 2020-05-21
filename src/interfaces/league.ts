import { Document, Types } from 'mongoose';

export interface League extends Document {
  _id: Types.ObjectId;
  name: string;
  collectionName: string;
  description: string;
  kind: number;
  leadersNumber: number;
  reward: number;
  loyaltyGiven: number;
  loyaltyReward: number;
  rewarded: boolean;
  defaultOpportunity: number;
  maxOpportunity: number;
  startTime: Date;
  endTime: Date;
  game: string;
  available: boolean;
  gameHidden: boolean;
  images: string[];
  mainImage: string;
  html: string;
  gameZip: string;
  color: string;
  playersNumber?: number;
  leadersAveragePlayedTimes?: number;
}
