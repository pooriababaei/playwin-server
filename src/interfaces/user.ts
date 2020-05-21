import { Document, Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  username: string;
  invitingUsers: Types.ObjectId[];
  reward: number;
  totalReward: number;
  coupon: number;
  achievements: Types.ObjectId[];
  participatedLeagues: Types.ObjectId[];
  phoneNumber: string;
  account: string;
  loyalty: number;
  avatar: string;
  appSource: string;
  createdAt: Date;
  updatedAt: Date;

  generateToken: () => string;
}
