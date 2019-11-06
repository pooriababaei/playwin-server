const debug = require('debug')('onStart:');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const {giveRewards} = require('./dbFunctions')
const League = mongoose.model('league');
const Achievement = mongoose.model('achievement');
const Job = mongoose.model('job');

if(process.env.NODE_APP_INSTANCE == 0) 
    require('./functions').createDirectories();

Achievement.createAchievements();
initiateGiveRewardCronForAllLeagues();

 async function initiateGiveRewardCronForAllLeagues() {
    const leagues = await League.find().lean();
    await Job.deleteMany({}).exec();

    for (let league of leagues) {
        if(league.rewarded == false && league.endTime > Date.now()) {
            var job = new Job({
                type:'reward',
                property: league.collectionName,
                fireTime: league.endTime,
                processOwner: process.env.NODE_APP_INSTANCE != null ? process.env.NODE_APP_INSTANCE : null
        });
        job.save((err,job)=> {
            if(!err) {
                schedule.scheduleJob(league.collectionName,league.endTime, async function(fireTime){
                    const jobInFireTime = await Job.findOne({property:this.name, type: 'reward'});
                        if(jobInFireTime && Math.abs(new Date(jobInFireTime.fireTime).getTime() - fireTime.getTime()) < 1000 && (!jobInFireTime.processOwner || jobInFireTime.processOwner == process.env.NODE_APP_INSTANCE )) {
                            giveRewards(league.collectionName).then(()=> {
                                debug('rewarded');
                                Job.deleteOne({property:league.collectionName, type:'reward'}).exec();
                            }).catch(()=> {
                                debug('error in rewarding');
                            });
                        }    
                });
            }
        });
        
        }
    }
}




