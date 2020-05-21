import { Document, Types } from 'mongoose';

export interface PublisherGame extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  available: boolean;
  mainImage: string;
  link: string;
}
