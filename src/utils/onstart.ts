import Debug from 'debug';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import {giveRewards} from './dbFunctions';
import {createDirectories} from './functions';
const Job = mongoose.model('job');
const debug = Debug('onStart:');
const League = mongoose.model('league');
const Achievement = mongoose.model('achievement');

if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
    createDirectories();
}
Achievement.createAchievements();
//initiateGiveRewardCronForAllLeagues();

async function initiateGiveRewardCronForAllLeagues() {
    const leagues = await League.find().lean();
    await Job.deleteMany({}).exec();

    for (const league of leagues) {
        if (league.rewarded === false && new Date(league.endTime).getTime() > Date.now()) {
            let job = new Job({
                type: 'reward',
                property: league.collectionName,
                fireTime: league.endTime,
                processOwner: process.env.NODE_APP_INSTANCE != null ? process.env.NODE_APP_INSTANCE : null,
        });
            job.save((err, job) => {
            if (!err) {
                schedule.scheduleJob(league.collectionName, league.endTime, async function(fireTime) {
                    const jobInFireTime = await Job.findOne({property: this.name, type: 'reward'});
                    if (jobInFireTime && Math.abs(new Date(jobInFireTime.fireTime).getTime() - fireTime.getTime()) < 1000 && (!jobInFireTime.processOwner || jobInFireTime.processOwner == process.env.NODE_APP_INSTANCE )) {
                            giveRewards(league.collectionName).then(() => {
                                debug('rewarded');
                                Job.deleteOne({property: league.collectionName, type: 'reward'}).exec();
                            }).catch(() => {
                                debug('error in rewarding');
                            });
                        }
                });
            }
        });
        }
    }
}
