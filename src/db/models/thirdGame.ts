import { Model, model, Schema } from 'mongoose';
import { ThirdGame } from '../../interfaces/thirdGame';
const gameSchema = new Schema(
  {
    name: { type: String, minLength: 3, required: true },

    description: { type: String },

    available: { type: Boolean, default: false },

    mainImage: { type: String, required: true },

    link: { type: String }
  },
  { versionKey: false }
);

const thirdGameModel: Model<ThirdGame> = model<ThirdGame>(
  'thirdGame',
  gameSchema
);
export default thirdGameModel;
