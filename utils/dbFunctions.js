const mongoose = require('mongoose');
const BoxPurchase = mongoose.model('boxPurchase');
const Box = mongoose.model('box');
const ToPay = mongoose.model('toPay');
const User = mongoose.model('user');
const League = mongoose.model('league');
const WeeklyLeader = mongoose.model('weeklyLeader');
const debug = require('debug')('dbFunctions:');


async function surroundingUsers(league, userId, limit) {
    const Scoreboard = mongoose.model(league);
    const user = await Scoreboard.findOne({user: userId});
    let count = await Scoreboard.find({
        $or: [{score: {$gt: user.score}},
            {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
    }).sort({score: -1, updatedAt: 1}).countDocuments();

    const rank = !count ? 1 : count + 1;


    const [worse, better] = await Promise.all([
        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$lt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$gt: user.updatedAt}}]}]
        }).sort({score: -1, updatedAt: 1}).limit(limit).populate({path:'user', select:'username avatar'}).lean(),

        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$gt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
        }).sort({score: 1, updatedAt: -1}).limit(limit).populate({path:'user', select:'username avatar'}).lean(),
    ]);

    let page = better.reverse().concat(user).concat(worse);
    const userIndex = page.findIndex(function (record) {
        return record.user === userId;
    });

    for (let i = 0; i < page.length; i++)
        page[i].rank = rank + (i - userIndex);
    return page;

}

function getRecords(league, limit, page) {
     return new Promise((resolve, reject) => {
         const Scoreboard = mongoose.model(league);
         const sort = {score: -1, updatedAt: 1};
         Scoreboard.find()
             .limit(limit)
             .skip(limit * (page - 1))
             .sort(sort)
             .exec(function (err, result) {
                 if (err) {
                     reject(err);
                 }
                 resolve(result);
             });
     });
}

async function userRank(league, userId) {

    const Scoreboard = mongoose.model(league);
    const user = await Scoreboard.findOne({user: userId});
    const count = await Scoreboard.find({
        $or: [{score: {$gt: user.score}},
            {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
    }).sort({score: -1, updatedAt: 1}).countDocuments();

    if (!count)
        return 1;
    return count + 1;
}

async function exchangecouponsToLeagueOppo(userId, oppo, league) {  // transaction
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
                    avatar:userInfo.avatar,
                    opportunities: league.defaultOpportunities + oppo,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
            }
            else if (record) {
                if (league.maxOpportunities && parseInt(record.played) + parseInt(oppo) + parseInt(record.opportunities) > parseInt(league.maxOpportunities)) {
                    throw 2;  //this is somehow a bad request. client mistake!!!
                }
    
                newRecord = record;
                newRecord.opportunities = parseInt(record.opportunities) < 0 ? (parseInt(record.opportunities) + 1 + parseInt(oppo)) : (parseInt(record.opportunities) + parseInt(oppo));
            }
    
            const newRecordToSave = new Scoreboard(newRecord);
            [nr, user] = await Promise.all([newRecordToSave.save(opts), User.findOneAndUpdate({_id: userId}, {$inc: {coupons: 0 - oppo}}, {session,new: true})]);
            await session.commitTransaction();
            session.endSession();
            return {record: nr, user: user};
    
        }
        else
        throw 1; // not enough oppo

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error; // Rethrow so calling function sees error
    }
  }

async function exchangecoinsToMoney(userId,coins) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = {session};
        const toPay = new ToPay({user:userId,amount:coins * coins_PRICE});
        const user = await User.findById(userId);
        if(user && user.coins < coins) throw 2; // not enough coins
        user.coins = user.coins - coins;
        await user.save(opts);
        await toPay.save(opts);

        await session.commitTransaction();
        session.endSession();
        return user.coins;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow so calling function sees error
    }
}

async function giveRewards(collectionName) {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const opts = {session};
        const league = await League.findOne({collectionName: collectionName}).lean();
        if(!league)
            throw 404;
        if(league.endTime >= Date.now() || league.rewarded === true)
            throw 400;
        const coinUsers = await getRecords(league.collectionName,league.leadersNumber,1);
        for (const record of coinUsers) {
            await User.findOneAndUpdate({_id: record.user},
                {$inc: {coins: league.coinsReward, totalCoins: league.coinsReward}},opts);
            const wl = new WeeklyLeader({
                user: record.user,
                coins: league.coinsReward
            });
            await wl.save(); // not so important to impact transaction
        }
        if(league.loyaltyGivens && league.loyaltyGivens !== 0) {
            const loyaltiesUsers = await getRecords(league.collectionName,league.loyaltyGivens,1);
            loyaltiesUsers.forEach(record => {
                User.findOneAndUpdate({_id: record.user},
                    {$inc: {loyalties:league.loyaltiesReward}},opts);
            });
        }

        const newLeague = await League.findOneAndUpdate({collectionName:collectionName},{rewarded : true},{session,new:true});
        await session.commitTransaction();
        session.endSession();
        return newLeague;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow so calling function sees error
    }
} //admin  remember too add opts fot transactions working

function saveBoxTransaction(userId, transactionId, boxId) {
    const p = {
        user: userId,
        transactionId: transactionId,
        box: boxId
    };
    const transaction = new BoxPurchase(p);

    return new promise((resolve, reject) => {
        transaction.save((err, transaction) => {
            if (err)
                reject(err);
            else if (transaction)
                resolve(transaction);
        });
    })

} // used inside of buyBox

async function buyBox(userId, transactionId, boxId) {
    const box = await Box.findById(boxId);
    const [user, bt] = Promise.all([User.findOneAndUpdate({_id: userId}, {$inc: {coupons: box.coupons}}, {new: true}), saveBoxTransaction(userId, transactionId, boxId)]);
    return {user: user, transaction: bt};

}  //not sure how the usage will be. from client or an payment api.


module.exports = {
    surroundingUsers,
    userRank,
    exchangecouponsToLeagueOppo,
    exchangecoinsToMoney,
    buyBox,
    giveRewards
};