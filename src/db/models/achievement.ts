import Debug from 'debug';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const debug = Debug('Achievement Model:');

const achievementSchema = new Schema({

    type: {type: String, required: true , enum: ['friend-invite', 'participated-leagues']},

    level: {type: Number, required: true},

    threshold: {type: Number, required: true},

    rewardType: {type: String , enum: ['coupon', 'money']},

    reward: {type: Number, required: true}  // 90 seconds

});
achievementSchema.index({type: 1 , level: 1}, {unique: true});

achievementSchema.statics.createAchievements = async function() {
    const Acievement = this;
    const achievements = [
        {type: 'friend-invite', threshold: 5, level: 1, rewardType: 'coupon', reward: 20},
        {type: 'friend-invite', threshold: 10, level: 2, rewardType: 'coupon', reward: 50},
        {type: 'friend-invite', threshold: 20, level: 3, rewardType: 'coupon', reward: 100},
        {type: 'friend-invite', threshold: 40, level: 4, rewardType: 'coupon', reward: 500},
        {type: 'participated-leagues', threshold: 5, level: 1, rewardType: 'coupon', reward: 20},
        {type: 'participated-leagues', threshold: 10, level: 2, rewardType: 'coupon', reward: 50},
        {type: 'participated-leagues', threshold: 20, level: 3, rewardType: 'coupon', reward: 100},
        {type: 'participated-leagues', threshold: 40, level: 4, rewardType: 'coupon', reward: 500}    ]
    await Acievement.create(achievements).catch(() => {});
};
export default mongoose.model('achievement', achievementSchema);