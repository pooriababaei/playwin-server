import { Document, Types } from "mongoose";

export interface Auth extends Document {
  phoneNumber: string;
  authToken: number;
  createAt: Date;
}
