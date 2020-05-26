import { Model, model, Schema } from 'mongoose';
import { PublisherGame } from '../../interfaces/publisherGame';
const gameSchema = new Schema(
  {
    name: { type: String, minLength: 3, required: true },

    description: { type: String },

    available: { type: Boolean, default: false },

    image: { type: String, required: true },

    link: { type: String },
  },
  { versionKey: false }
);

const publisherGameModel: Model<PublisherGame> = model<PublisherGame>('publisherGame', gameSchema);
export default publisherGameModel;
