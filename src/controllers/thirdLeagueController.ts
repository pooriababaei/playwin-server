import Debug from 'debug';
import schedule from 'node-schedule';
import path from 'path';
import _ from 'underscore';
import urljoin from 'url-join';
import { scoreboardModel } from '../db/models/scoreboard';
import { giveRewardsHelper } from './currencyController';
import { createJobHelper, deleteJobHelper } from './jobController';
import ThirdLeague from '../db/models/thirdLeague';
import Job from '../db/models/job';
import { Types } from 'mongoose';
import ThirdGame from '../db/models/thirdGame';
const debug = Debug('ThirdLeague Controller:');

export async function createLeague(req, res) {
  try {
    const info = _.pick(
      req.body,
      'collectionName',
      'description',
      'startTime',
      'endTime',
      'available',
      'defaultOpportunity',
      'maxOpportunity',
      'leadersNumber',
      'reward'
    );
    if (!req.gameId) return res.sendStatus(400);

    const game = await ThirdGame.findById(req.gameId);

    if (!game) return res.sendStatus(404);

    info.game = req.gameId;

    const league = await new ThirdLeague(info).save();
    if (!league) {
      return res.sendStatus(400);
    }
    scoreboardModel(league.collectionName, league.defaultOpportunity - 1);
    const job = {
      property: league.collectionName,
      type: 'reward',
      fireTime: new Date(league.endTime),
      processOwner:
        process.env.NODE_APP_INSTANCE != null
          ? process.env.NODE_APP_INSTANCE
          : null
    };
    createJobHelper(job, giveRewardsHelper, true)
      .then(() => res.status(200).send(league))
      .catch(err => {
        debug(err);
        return res.sendStatus(500);
      });
  } catch (error) {
    return res.sendStatus(500);
  }
}

export async function updateLeague(req, res) {
  try {
    const info = _.pick(
      req.body,
      'collectionName',
      'description',
      'startTime',
      'endTime',
      'available',
      'defaultOpportunity',
      'maxOpportunity',
      'leadersNumber',
      'reward'
    );

    const league = await ThirdLeague.findById(req.params._id).lean();
    let shouldSchedule = true;
    if (league && info.endTime) {
      const oldEndTime = new Date(league.endTime).getTime();
      const newEndTime = new Date(info.endTime).getTime();
      if (
        oldEndTime === newEndTime ||
        league.rewarded === true ||
        league.endTime < Date.now()
      ) {
        shouldSchedule = false;
      }
    }
    ThirdLeague.findOneAndUpdate(
      {
        _id: req.params.id
      },
      info,
      {
        new: true
      },
      (err, league) => {
        if (err) {
          return res.status(400).send();
        } else if (!league) {
          return res.sendStatus(404);
        }
        if (shouldSchedule) {
          const job = {
            fireTime: new Date(league.endTime),
            processOwner:
              process.env.NODE_APP_INSTANCE != null
                ? process.env.NODE_APP_INSTANCE
                : null
          };
          Job.findOneAndUpdate(
            {
              property: league.collectionName,
              type: 'reward'
            },
            job,
            (err, dbJob) => {
              if (err) {
                debug(err);
              }
              if (dbJob && !err) {
                if (
                  !dbJob.processOwner ||
                  dbJob.processOwner.toString() ===
                    process.env.NODE_APP_INSTANCE
                ) {
                  schedule.rescheduleJob(league.collectionName, league.endTime);
                } else {
                  createJobHelper(dbJob, giveRewardsHelper, false)
                    .then(() => res.status(200).send(league))
                    .catch(err => {
                      debug(err);
                      return res.sendStatus(500);
                    });
                }
              }
            }
          );
        }
        return res.status(200).send(league);
      }
    );
  } catch (error) {
    return res.sendStatus(500);
  }
}
