import { Document, Types } from 'mongoose';

export interface Game extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  available: boolean;
  images: string;
  mainImage: string;
  game: string;
  html: string;
  gameZip: string;
  color: string;
}
