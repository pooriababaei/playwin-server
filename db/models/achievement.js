const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('Achievement Model:');

const achievementSchema = new Schema({

    name: {type: String,required:true},

    type: {type: String, required: true ,enum:['friend-invite','participated-leagues']},

    level: {type: Number, required:true},

    threshold:{type: Number, required:true},

    rewardType: {type: String ,enum:['coupon','money']},

    reward: {type: Number, required:true}  //90 seconds

});

achievementSchema.statics.createAchievements = async function () {
    let Acievement = this;
    let achievements = [
        {name:'دعوت از دوستان',type: 'friend-invite', threshold: 5,level:1, rewardType:'coupon', reward:15},
        {name:'دعوت از دوستان',type: 'friend-invite', threshold: 10,level:2,rewardType:'coupon', reward:50},
        {name:'دعوت از دوستان',type: 'friend-invite', threshold: 20,level:3,rewardType:'coupon', reward:100},
        {name:'دعوت از دوستان',type: 'friend-invite', threshold: 40,level:4,rewardType:'coupon', reward:500},
        {name:'شرکت در لیگ',type: 'participated-leagues', threshold:5,level:1, rewardType:'coupon', reward:15},
        {name:'شرکت در لیگ',type: 'participated-leagues', threshold:10,level:2, rewardType:'coupon', reward:50},
        {name:'شرکت در لیگ',type: 'participated-leagues', threshold:20,level:3, rewardType:'coupon', reward:100},
        {name: 'شرکت در لیگ',type: 'participated-leagues', threshold:40,level:4, rewardType:'coupon', reward:500}    ]
    await Acievement.create(achievements).catch(e=>{});

   
};
achievementSchema.index({type:1 , level:1}, {unique: true});
module.exports = mongoose.model('achievement', achievementSchema);