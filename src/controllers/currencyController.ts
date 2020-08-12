import Debug from 'debug';
import mongoose from 'mongoose';
import { REWARD_TRESHOLD_TO_EXCHANGE } from '../utils/globals';
import ToPay from '../db/models/toPay';
import User from '../db/models/user';
import League from '../db/models/league';
import { scoreboardModel } from '../db/models/scoreboard';
import WeeklyReward from '../db/models/weeklyReward';
import Achievement from '../db/models/achievement';

const debug = Debug('Currency Controller:');

///////// helper functions
async function exchangecouponToLeagueOppoHelper(userId, oppo, league) {
  try {
    const Scoreboard = scoreboardModel(league.collectionName);
    const userInfo = await User.findById(userId);
    if (userInfo && userInfo.coupon >= oppo) {
      const record = await Scoreboard.findOne({ user: userId });
      let newRecord = null;

      if (record == null) {
        if (
          league.maxOpportunity &&
          parseInt(oppo) + league.dafaultOpportunity > league.maxOpportunity
        ) {
          throw 2; //this is somehow a bad request. client mistake!!!
        }
        newRecord = {
          user: userId,
          played: 0,
          avatar: userInfo.avatar,
          opportunity: league.defaultOpportunity + oppo,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      } else if (record) {
        if (
          league.maxOpportunity &&
          record.played + oppo + record.opportunity > league.maxOpportunity
        ) {
          throw 2; // this is somehow a bad request. client mistake!!!
        }

        newRecord = record;
        newRecord.opportunity =
          record.opportunity < 0
            ? record.opportunity + 1 + parseInt(oppo)
            : record.opportunity + parseInt(oppo);
      }

      const newRecordToSave = new Scoreboard(newRecord);
      const [nr, user]: any = await Promise.all([
        newRecordToSave.save(),
        User.findOneAndUpdate({ _id: userId }, { $inc: { coupon: 0 - oppo } }, { new: true }),
      ]);
      return { record: nr, user };
    } else {
      throw 1;
    } // not enough oppo
  } catch (error) {
    throw error; // Rethrow so calling function sees error
  }
}
async function exchangeRewardToMoneyHelper(userId) {
  try {
    const user = await User.findById(userId);
    if (user && user.reward < REWARD_TRESHOLD_TO_EXCHANGE) {
      throw 2;
    } // not enough reward
    const toPay = new ToPay({ user: userId, amount: user.reward });
    await toPay.save();
    user.reward = 0;
    await user.save();

    return user.reward;
  } catch (error) {
    throw error; // Rethrow so calling function sees error
  }
}
export async function giveRewardsHelper(collectionName) {
  try {
    const league = await League.findOne({ collectionName }).lean();
    if (!league) {
      throw 404;
    }
    if (league.endTime >= new Date() || league.rewarded === true) {
      throw 400;
    }
    const rewardUsers: any = await getRecordsHelper(league.collectionName, league.leadersNumber, 1);
    for (const record of rewardUsers) {
      await User.findOneAndUpdate(
        { _id: record.user },
        {
          $inc: {
            reward: league.reward / league.leadersNumber,
            totalReward: league.reward,
          },
        }
      );
      const wl = new WeeklyReward({
        user: record.user,
        reward: league.reward / league.leadersNumber,
      });
      await wl.save().catch(() => {}); // not so important to impact transaction
    }
    if (league.loyaltyGiven && league.loyaltyGiven !== 0) {
      const loyaltyUsers: any = await getRecordsHelper(
        league.collectionName,
        league.loyaltyGiven,
        1
      );
      loyaltyUsers.forEach((record) => {
        User.findOneAndUpdate({ _id: record.user }, { $inc: { loyalty: league.loyaltyReward } });
      });
    }

    const newLeague = await League.findOneAndUpdate(
      { collectionName },
      { rewarded: true },
      { new: true }
    );
    return newLeague;
  } catch (error) {
    throw error; // Rethrow so calling function sees error
  }
}
//with transaction
// async function exchangecouponToLeagueOppoHelper(userId, oppo, league) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const opts = { session };
//     const Scoreboard = scoreboardModel(league.collectionName);
//     const userInfo = await User.findById(userId);
//     if (userInfo && userInfo.coupon >= oppo) {
//       const record = await Scoreboard.findOne({ user: userId });
//       let newRecord = null;

//       if (record == null) {
//         if (
//           league.maxOpportunity &&
//           parseInt(oppo) + league.dafaultOpportunity > league.maxOpportunity
//         ) {
//           throw 2; //this is somehow a bad request. client mistake!!!
//         }
//         newRecord = {
//           user: userId,
//           played: 0,
//           avatar: userInfo.avatar,
//           opportunity: league.defaultOpportunity + oppo,
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//         };
//       } else if (record) {
//         if (
//           league.maxOpportunity &&
//           record.played + oppo + record.opportunity > league.maxOpportunity
//         ) {
//           throw 2; // this is somehow a bad request. client mistake!!!
//         }

//         newRecord = record;
//         newRecord.opportunity =
//           record.opportunity < 0
//             ? record.opportunity + 1 + parseInt(oppo)
//             : record.opportunity + parseInt(oppo);
//       }

//       const newRecordToSave = new Scoreboard(newRecord);
//       const [nr, user]: any = await Promise.all([
//         newRecordToSave.save(opts),
//         User.findOneAndUpdate(
//           { _id: userId },
//           { $inc: { coupon: 0 - oppo } },
//           { session, new: true }
//         ),
//       ]);
//       await session.commitTransaction();
//       session.endSession();
//       return { record: nr, user };
//     } else {
//       throw 1;
//     } // not enough oppo
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error; // Rethrow so calling function sees error
//   }
// }
// async function exchangeRewardToMoneyHelper(userId) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const opts = { session };
//     const user = await User.findById(userId);
//     if (user && user.reward < REWARD_TRESHOLD_TO_EXCHANGE) {
//       throw 2;
//     } // not enough reward
//     const toPay = new ToPay({ user: userId, amount: user.reward });
//     await toPay.save(opts);
//     user.reward = 0;
//     await user.save(opts);

//     await session.commitTransaction();
//     session.endSession();
//     return user.reward;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error; // Rethrow so calling function sees error
//   }
// }
// export async function giveRewardsHelper(collectionName) {
//   const session = await mongoose.startSession();

//   session.startTransaction();
//   try {
//     const opts = { session };
//     const league = await League.findOne({ collectionName }).lean();
//     if (!league) {
//       throw 404;
//     }
//     if (league.endTime >= new Date() || league.rewarded === true) {
//       throw 400;
//     }
//     const rewardUsers: any = await getRecordsHelper(league.collectionName, league.leadersNumber, 1);
//     for (const record of rewardUsers) {
//       await User.findOneAndUpdate(
//         { _id: record.user },
//         {
//           $inc: {
//             reward: league.reward / league.leadersNumber,
//             totalReward: league.reward,
//           },
//         },
//         opts
//       );
//       const wl = new WeeklyReward({
//         user: record.user,
//         reward: league.reward / league.leadersNumber,
//       });
//       await wl.save().catch(() => {}); // not so important to impact transaction
//     }
//     if (league.loyaltyGiven && league.loyaltyGiven !== 0) {
//       const loyaltyUsers: any = await getRecordsHelper(
//         league.collectionName,
//         league.loyaltyGiven,
//         1
//       );
//       loyaltyUsers.forEach((record) => {
//         User.findOneAndUpdate(
//           { _id: record.user },
//           { $inc: { loyalty: league.loyaltyReward } },
//           opts
//         );
//       });
//     }

//     const newLeague = await League.findOneAndUpdate(
//       { collectionName },
//       { rewarded: true },
//       { session, new: true }
//     );
//     await session.commitTransaction();
//     session.endSession();
//     return newLeague;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error; // Rethrow so calling function sees error
//   }
// }

function getRecordsHelper(league, limit, page) {
  return new Promise((resolve, reject) => {
    const Scoreboard = mongoose.model(league);
    const sort = { score: -1, updatedAt: 1 };
    Scoreboard.find()
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(sort)
      .exec((err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
  });
}
///////// helper functions

export function exchangecouponToLeagueOppo(req, res) {
  const league = req.league;
  const oppo = req.params.opportunity;

  if (!oppo || oppo === 0) return res.sendStatus(400);

  exchangecouponToLeagueOppoHelper(req.userId, oppo, league)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      if (err === 1 || err === 2) {
        return res.status(400).send({
          code: err,
        });
      }
      res.status(500).send(err.toString());
    }); // if throws 1 not enough oppo.
  // if throws 2 maxOpportunity bound(client mistake).
  // otherwise returns updated user and record
}

export function exchangeRewardToMoney(req, res) {
  try {
    exchangeRewardToMoneyHelper(req.userId)
      .then((result) => {
        res.status(200).send(result.toString());
      })
      .catch((err) => {
        if (err === 2) {
          return res.status(400).send({
            code: err,
          });
        }
        res.sendStatus(500);
      });
  } catch (e) {
    return res.sendStatus(500);
  }
}

export function giveRewards(req, res) {
  const collectionName = req.params.collectionName;
  giveRewardsHelper(collectionName)
    .then((result) => {
      return res.status(200).send(result);
    })
    .catch((err) => {
      debug(err);
      return res.sendStatus(500);
    });
}

export function achievements(req, res) {
  Achievement.find({}, (err, achievements) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.status(200).send(achievements);
  });
}

export async function achieve(req, res) {
  const achievementId = req.params.id;
  try {
    const achievement = await Achievement.findById(achievementId).lean();
    if (!achievement) {
      return res.sendStatus(400);
    }
    const user = await User.findOne({
      username: req.username,
    });
    if (!user || (user.achievements != null && user.achievements.indexOf(achievementId) >= 0)) {
      return res.sendStatus(400);
    }
  } catch (e) {
    return res.sendStatus(400);
  }
  User.findOneAndUpdate(
    {
      username: req.username,
    },
    {
      $push: {
        achievements: achievementId,
      },
    },
    {
      new: true,
    },
    (err, updatedUser) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!updatedUser) {
        return res.sendStatus(400);
      }
      return res.status(200).send(updatedUser);
    }
  );
}
