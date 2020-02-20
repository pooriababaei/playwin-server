import { Document, Types } from 'mongoose';

export interface ThirdGame extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  available: boolean;
  mainImage: string;
  link: string;
}
