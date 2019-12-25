import { Model, model, Schema } from "mongoose";
import { WeeklyLeader } from "../../interfaces/weeklyLeader";
const weeklyLeaderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user", index: true },

  reward: { type: Number, default: 0, index: true },

  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }
});

const weekLyLeaderModel: Model<WeeklyLeader> = model<WeeklyLeader>(
  "weeklyLeader",
  weeklyLeaderSchema
);
export default weekLyLeaderModel;
