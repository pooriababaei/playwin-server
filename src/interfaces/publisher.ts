import { Document, Types } from 'mongoose';

export interface Publisher extends Document {
  _id: Types.ObjectId;
  id: any;
  publisherGame: Types.ObjectId;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  createdAt: Date;
  updatedAt: Date;

  generateToken: () => string;
}
