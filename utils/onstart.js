const debug = require('debug')('onStart:');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const {giveRewards} = require('./dbFunctions')
const League = mongoose.model('league');

if(process.env.NODE_APP_INSTANCE == 0) {
    require('./functions').createDirectories(); 
    initiateGiveRewardCronForAllLeagues();
}

async function initiateGiveRewardCronForAllLeagues() {
    const leagues = League.find.lean();
    for (let league of leagues) {
        if(league.rewarded == false) {
            schedule.scheduleJob(league.endTime, async function(){
                const newLeague = await giveRewards(league.collectionName);
                debug(newLeague.rewarded);
            });
        }
    }
}




