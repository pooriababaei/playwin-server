import { Document, Types } from 'mongoose';

export interface Admin extends Document {
  _id: Types.ObjectId;
  id: any;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  generateToken: () => string;
}
