import { Model, model, Schema } from 'mongoose';
import { WeeklyReward } from '../../interfaces/weeklyReward';
const weeklyRewardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', index: true },

  reward: { type: Number, default: 0, index: true },

  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

const weekLyLeaderModel: Model<WeeklyReward> = model<WeeklyReward>(
  'weeklyReward',
  weeklyRewardSchema
);
export default weekLyLeaderModel;
