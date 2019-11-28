import Debug from 'debug';
import mongoose from 'mongoose';
import {COINS_TRESHOLD_TO_EXCHANGE, COIN_PRICE} from '../utils/globals';
const ToPay = mongoose.model('toPay');
const User = mongoose.model('user');
const League = mongoose.model('league');
const WeeklyLeader = mongoose.model('weeklyLeader');
const Achievement = mongoose.model('achievement');
const debug = Debug('Currency Controller:');

///////// helper functions
async function exchangecouponsToLeagueOppoHelper(userId, oppo, league) {  // transaction
    // let[nr,user]=null;
     const session = await mongoose.startSession();
     session.startTransaction();
     try {
         const opts = {session};
         const Scoreboard = mongoose.model(league.collectionName);
         const userInfo = await User.findById(userId);
         if (userInfo && userInfo.coupons >= oppo) {
 
             const record = await Scoreboard.findOne({user: userId});
             let newRecord = null;
 
             if (record == null) {
                 if (league.maxOpportunities &&  parseInt(oppo) + parseInt(league.dafaultOpportunities) > parseInt(league.maxOpportunities)) {
                     throw 2; //this is somehow a bad request. client mistake!!!
                 }
                 newRecord = {
                     user: userId,
                     played: 0,
                     avatar: userInfo.avatar,
                     opportunities: league.defaultOpportunities + oppo,
                     createdAt: Date.now(),
                     updatedAt: Date.now()
                 };
             }
             else if (record) {
                 if (league.maxOpportunities && parseInt(record.played) + parseInt(oppo) + parseInt(record.opportunities) > parseInt(league.maxOpportunities)) {
                     throw 2;  // this is somehow a bad request. client mistake!!!
                 }
 
                 newRecord = record;
                 newRecord.opportunities = parseInt(record.opportunities) < 0 ? (parseInt(record.opportunities) + 1 + parseInt(oppo)) : (parseInt(record.opportunities) + parseInt(oppo));
             }
 
             const newRecordToSave = new Scoreboard(newRecord);
             const [nr, user]: any = await Promise.all([newRecordToSave.save(opts), User.findOneAndUpdate({_id: userId},
                  {$inc: {coupons: 0 - oppo}}, {session, new: true})]);
             await session.commitTransaction();
             session.endSession();
             return {record: nr, user};
         } else {
         throw 1;
         } // not enough oppo
 
     } catch (error) {
       await session.abortTransaction();
       session.endSession();
       throw error; // Rethrow so calling function sees error
     }
}
async function exchangecoinsToMoneyHelper(userId, coins) {
     const session = await mongoose.startSession();
     session.startTransaction();
     try {
         const opts = {session};
         const toPay = new ToPay({user: userId, amount: coins * COIN_PRICE});
         const user = await User.findById(userId);
         if (user && user.coins < coins) { throw 2; } // not enough coins
         user.coins = user.coins - coins;
         await user.save(opts);
         await toPay.save(opts);
 
         await session.commitTransaction();
         session.endSession();
         return user.coins;
     } catch (error) {
         await session.abortTransaction();
         session.endSession();
         throw error; // Rethrow so calling function sees error
     }
}
export async function giveRewardsHelper(collectionName) {
    debug('here10');

    const session = await mongoose.startSession();

    session.startTransaction();
    try {
         const opts = {session};
         const league = await League.findOne({collectionName}).lean();
         if (!league) {
             throw 404;
         }
         if (league.endTime >= Date.now() || league.rewarded === true) {
             throw 400;
         }
         const coinUsers: any = await getRecordsHelper(league.collectionName, league.leadersNumber, 1);
         for (const record of coinUsers) {
             await User.findOneAndUpdate({_id: record.user},
                 {$inc: {coins: league.coinsReward, totalCoins: league.coinsReward}}, opts);
             const wl = new WeeklyLeader({
                 user: record.user,
                 coins: league.coinsReward
             });
             await wl.save().catch(() => {}); // not so important to impact transaction
         }
         if (league.loyaltyGivens && league.loyaltyGivens !== 0) {
             const loyaltiesUsers : any = await getRecordsHelper(league.collectionName, league.loyaltyGivens, 1);
             loyaltiesUsers.forEach((record) => {
                 User.findOneAndUpdate({_id: record.user},
                     {$inc: {loyalties: league.loyaltiesReward}}, opts);
             });
         }

         const newLeague = await League.findOneAndUpdate({collectionName},
             {rewarded : true}, {session, new: true});
         await session.commitTransaction();
         session.endSession();
         return newLeague;
     } catch (error) {
         await session.abortTransaction();
         session.endSession();
         throw error; // Rethrow so calling function sees error
     }
}
function getRecordsHelper(league, limit, page) {
    return new Promise((resolve, reject) => {
        const Scoreboard = mongoose.model(league);
        const sort = {score: -1, updatedAt: 1};
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

export function exchangecouponsToLeagueOppo(req, res) {
    const league = req.league;
    const oppo = req.params.opportunities;

    exchangecouponsToLeagueOppoHelper(req.userId, oppo, league).then((result) => {
        res.status(200).json(result);
    }).catch((err) => {
        if (err === 1 || err === 2) {
            return res.status(400).send({
                code: err
            });
        }
        res.status(500).send(err.toString());
    }); // if throws 1 not enough oppo.
    // if throws 2 maxOpportunities bound(client mistake).
    // otherwise returns updated user and record
}

export function exchangecoinsToMoney(req, res) {
    const coins = parseInt(req.params.coins);
    try {
        if (isNaN(coins) || coins <= 0) {
            return res.sendStatus(400);
        }
        if (coins < COINS_TRESHOLD_TO_EXCHANGE) {
            return res.status(400).send({
                code: 1
            });
        } // Less than treshold for exchange. somehow is the client mistake.
        exchangecoinsToMoneyHelper(req.userId, coins).then((result) => {
            res.status(200).send(result.toString());
        }).catch((err) => {
            if (err === 2) {
                return res.status(400).send({
                    code: err
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
    giveRewardsHelper(collectionName).then((result) => {
        return res.status(200).send(result);
    }).catch((err) => {
        debug(err)
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
            username: req.username
        });
        if (!user || (user.achievements != null && user.achievements.indexOf(achievementId) >= 0)) {
            return res.sendStatus(400);
        }
    } catch (e) {
        return res.sendStatus(400);
    }
    User.findOneAndUpdate({
        username: req.username
    }, {
        $push: {
            achievements: achievementId
        }
    }, {
        new: true
    }, (err, updatedUser) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (!updatedUser) {
            return res.sendStatus(400);
        }
        return res.status(200).send(updatedUser);
    });
}