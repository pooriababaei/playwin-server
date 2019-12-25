import Debug from "debug";
import { Achievement } from "../../interfaces/achievement";
import { model, Model, Schema } from "mongoose";
import { User } from "../../interfaces/user";
const debug = Debug("Achievement Model:");

const achievementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["friend-invite", "participated-leagues"]
    },

    level: { type: Number, required: true },

    threshold: { type: Number, required: true },

    rewardType: { type: String, enum: ["coupon", "money"] },

    reward: { type: Number, required: true } // 90 seconds
  },
  { versionKey: false }
);
achievementSchema.index({ type: 1, level: 1 }, { unique: true });

achievementSchema.statics.createAchievements = async function() {
  const Acievement = this;
  const achievements = [
    {
      type: "friend-invite",
      threshold: 5,
      level: 1,
      rewardType: "coupon",
      reward: 20
    },
    {
      type: "friend-invite",
      threshold: 10,
      level: 2,
      rewardType: "coupon",
      reward: 50
    },
    {
      type: "friend-invite",
      threshold: 20,
      level: 3,
      rewardType: "coupon",
      reward: 100
    },
    {
      type: "friend-invite",
      threshold: 40,
      level: 4,
      rewardType: "coupon",
      reward: 500
    },
    {
      type: "participated-leagues",
      threshold: 5,
      level: 1,
      rewardType: "coupon",
      reward: 20
    },
    {
      type: "participated-leagues",
      threshold: 10,
      level: 2,
      rewardType: "coupon",
      reward: 50
    },
    {
      type: "participated-leagues",
      threshold: 20,
      level: 3,
      rewardType: "coupon",
      reward: 100
    },
    {
      type: "participated-leagues",
      threshold: 40,
      level: 4,
      rewardType: "coupon",
      reward: 500
    }
  ];
  await Acievement.create(achievements).catch(() => {});
};
interface AchievementModel extends Model<Achievement> {
  createAchievements: () => void;
}
const achievementModel: AchievementModel = model<Achievement, AchievementModel>(
  "achievement",
  achievementSchema
);

export default achievementModel;
