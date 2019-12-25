import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import schedule from 'node-schedule';
import { giveRewardsHelper } from '../controllers/currencyController';
import Job from '../db/models/job';
import League from '../db/models/league';
import Achievement from '../db/models/achievement';
const debug = Debug('onStart:');

export async function run() {
  if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
    createDirectories();
  }
  Achievement.createAchievements();
  initiateGiveRewardCronForAllLeagues();
}
async function initiateGiveRewardCronForAllLeagues() {
  const leagues = await League.find().lean();
  await Job.deleteMany({}).exec();

  for (const league of leagues) {
    if (
      league.rewarded === false &&
      new Date(league.endTime).getTime() > Date.now()
    ) {
      let job = new Job({
        type: 'reward',
        property: league.collectionName,
        fireTime: league.endTime,
        processOwner:
          process.env.NODE_APP_INSTANCE != null
            ? process.env.NODE_APP_INSTANCE
            : null
      });
      job.save((err, job) => {
        if (!err) {
          schedule.scheduleJob(
            league.collectionName,
            league.endTime,
            async function(fireTime) {
              const jobInFireTime = await Job.findOne({
                property: this.name,
                type: 'reward'
              });
              if (
                jobInFireTime &&
                Math.abs(
                  new Date(jobInFireTime.fireTime).getTime() -
                    fireTime.getTime()
                ) < 1000 &&
                (!jobInFireTime.processOwner ||
                  jobInFireTime.processOwner.toString() ===
                    process.env.NODE_APP_INSTANCE)
              ) {
                giveRewardsHelper(league.collectionName)
                  .then(() => {
                    debug('rewarded');
                    Job.deleteOne({
                      property: league.collectionName,
                      type: 'reward'
                    }).exec();
                  })
                  .catch(() => {
                    debug('error in rewarding');
                  });
              }
            }
          );
        }
      });
    }
  }
}
function createDirectories() {
  const dir = path.join(__dirname, '../../public/');
  const dir1 = path.join(__dirname, '../../public/leagues');
  const dir2 = path.join(__dirname, '../../public/games');
  const dir3 = path.join(__dirname, '../../public/boxes');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(dir1)) {
    fs.mkdirSync(dir1);
  }
  if (!fs.existsSync(dir2)) {
    fs.mkdirSync(dir2);
  }
  if (!fs.existsSync(dir3)) {
    fs.mkdirSync(dir3);
  }
}
