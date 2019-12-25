import { Model, model, Schema } from "mongoose";
import { Game } from "../../interfaces/game";
const gameSchema = new Schema(
  {
    name: { type: String, minLength: 3, required: true },

    description: { type: String },

    available: { type: Boolean, default: false },

    images: [{ type: String }],

    mainImage: { type: String, required: true },

    html: { type: String },

    gameZip: { type: String },

    color: { type: String }
  },
  { versionKey: false }
);

const gameModel: Model<Game> = model<Game>("game", gameSchema);
export default gameModel;
