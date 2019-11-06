const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('Achievement Model:');

const achievementSchema = new Schema({

    name: {type: String, required: true ,enum:['friend-invite','participated-leagues']},

    level: {type: Number, required:true},

    rewardType: {type: String ,enum:['coupon','money']},

    reward: {type: Number, required:true}  //90 seconds

}, {collection: 'achievements'});

achievementSchema.statics.createAchievements = async function () {
    let Acievement = this;
    let achievements = [
        {name: 'friend-invite', level: 5, rewardType:'coupon', reward:15},
        {name: 'friend-invite', level: 10,rewardType:'coupon', reward:50},
        {name: 'friend-invite', level: 20,rewardType:'coupon', reward:100},
        {name: 'friend-invite', level: 40,rewardType:'coupon', reward:500},
        {name: 'participated-leagues', level:5, rewardType:'coupon', reward:15},
        {name: 'participated-leagues', level:10, rewardType:'coupon', reward:50},
        {name: 'participated-leagues', level:20, rewardType:'coupon', reward:100},
        {name: 'participated-leagues', level:40, rewardType:'coupon', reward:500}    ]
    await Acievement.create(achievements).catch(e=>{});

   
};
achievementSchema.index({name:1 , level:1}, {unique: true});
module.exports = mongoose.model('achievement', achievementSchema);