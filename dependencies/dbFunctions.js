const mongoose = require('mongoose');
const Box_Transaction = mongoose.model('boxTransaction');
const Box = mongoose.model('box');
const ToPay = mongoose.model('toPay');
const User = mongoose.model('user');
const League = mongoose.model('league');
const {client, dbName} = require('../dependencies/mondb');
const debug = require('debug')('dbFunctions');



async function surroundingUsers(league, userId, limit) {
    const Scoreboard = mongoose.model(league);
    const user = await Scoreboard.findOne({user: userId});

    const [worse, better] = await Promise.all([
        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$lt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$gt: user.updatedAt}}]}]
        }).sort({score: -1, updatedAt: 1}).limit(limit),

        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$gt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
        }).sort({score: 1, updatedAt: -1}).limit(limit),
    ]);

    return better.reverse().concat(user).concat(worse);
}   // doesn't show ranks

async function edgeUsersRank(league,edge1,edge2) {
    const Scoreboard = mongoose.model(league);
    const count = await Scoreboard.count();
    const responseInfo  ={};
    if(edge1 != null && edge1 != 0 &&  edge1 < count) {
        responseInfo.edge1User = await new Promise((resolve, reject) => {
            client.connect(function (err, client) {
                if (err) {
                    reject(err);
                }
                const db = client.db(dbName);
                const sort = {score: -1, updatedAt: 1};

                db.collection(league)
                    .find()
                    .sort(sort)
                    .limit(1)
                    .skip(parseInt(edge1) - 1)
                    .toArray(function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        resolve(result);
                    });
            });
        });
    }
    if(edge2 != null && edge2 != 0 &&  edge2 < count) {
        responseInfo.edge2User = await new Promise((resolve, reject) => {
            client.connect(function (err, client) {
                if (err) {
                    reject(err);
                }
                const db = client.db(dbName);
                const sort = {score: -1, updatedAt: 1};

                db.collection(league)
                    .find()
                    .sort(sort)
                    .limit(1)
                    .skip(parseInt(edge2) -1)
                    .toArray(function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        resolve(result);
                    });
            });
        });
    }
    return  responseInfo;
}

async function surroundingUserRanks(league, userId, limit) {
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
        }).sort({score: -1, updatedAt: 1}).limit(limit),

        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$gt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
        }).sort({score: 1, updatedAt: -1}).limit(limit),
    ]);

    let page = better.reverse().concat(user).concat(worse);
    const userIndex = page.findIndex(function (record) {
        return record.user == userId;
    });


    let ranks = [];
    for (let i = 0; i < page.length; i++) {
        const o = {...page[i]._doc, rank: rank + (i - userIndex)};
        ranks.push(o);

    }
    return ranks;

}

function pagingUsers(league, limit, page) {
    return new Promise((resolve, reject) => {
        client.connect(function (err, client) {
            if (err) {
                reject(err);
            }
            const db = client.db(dbName);
            const sort = {score: -1, updatedAt: 1};

            db.collection(league)
                .find()
                .sort(sort)
                .limit(limit)
                .skip(limit * (page - 1))
                .toArray(function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
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

async function exchangeTotalOppoToLeagueOppo1(userId, username, oppo, league) {

    const Scoreboard = mongoose.model(league.spec);
    const userInfo = await User.findById(userId);
    if (userInfo && userInfo.opportunities >= oppo) {

        const record = await Scoreboard.findOne({user: userId});
        let newRecord = null;

        if (!record) {
            if (league.max_opportunities && oppo > league.max_opportunities) {
                return 2 //this is somehow a bad request. client mistake!!!
            }
            newRecord = {
                user: userId,
                username: username,
                played: 0,
                opportunities: league.default_opportunities + oppo,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }
        else if (record) {
            debug(parseInt(record.played) + parseInt(oppo))
            if (league.max_opportunities && parseInt(record.played) + parseInt(oppo) > parseInt(league.max_opportunities)) {
                return 2 //this is somehow a bad request. client mistake!!!
            }

            newRecord = record;
            newRecord.opportunities = parseInt(record.opportunities) < 0 ? (parseInt(record.opportunities) + 1 + parseInt(oppo)) : (parseInt(record.opportunities) + parseInt(oppo));
        }

        const newRecordToSave = new Scoreboard(newRecord);
        const [nr, user] = await Promise.all([newRecordToSave.save(), User.findOneAndUpdate({_id: userId}, {$inc: {opportunities: 0 - oppo}}, {new: true})]);

        return {record: nr, user: user};


    }
    else
        return 1; // not enough oppo


}

async function exchangeTotalOppoToLeagueOppo(userId, username, oppo, league) {  // transaction 
   // let[nr,user]=null;
    const session = await mongoose.startSession();


    session.startTransaction();
    try {
        const opts = {session};
        const Scoreboard = mongoose.model(league.spec);
        const userInfo = await User.findById(userId);
        if (userInfo && userInfo.opportunities >= oppo) {

            const record = await Scoreboard.findOne({user: userId});
            let newRecord = null;
    
            if (record == null) {
                if (league.max_opportunities &&  parseInt(oppo) + parseInt(league.default_opportunities) > parseInt(league.max_opportunities)) {
                    throw 2; //this is somehow a bad request. client mistake!!!
                }
                newRecord = {
                    user: userId,
                    username: username,
                    played: 0,
                    avatar:userInfo.avatar,
                    opportunities: league.default_opportunities + oppo,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
            }
            else if (record) {
                if (league.max_opportunities && parseInt(record.played) + parseInt(oppo) + parseInt(record.opportunities) > parseInt(league.max_opportunities)) {
                    throw 2;  //this is somehow a bad request. client mistake!!!
                }
    
                newRecord = record;
                newRecord.opportunities = parseInt(record.opportunities) < 0 ? (parseInt(record.opportunities) + 1 + parseInt(oppo)) : (parseInt(record.opportunities) + parseInt(oppo));
            }
    
            const newRecordToSave = new Scoreboard(newRecord);
           let [nr, user] = await Promise.all([newRecordToSave.save(), User.findOneAndUpdate({_id: userId}, {$inc: {opportunities: 0 - oppo}}, {new: true})]);
          //  [nr, user] = await Promise.all([newRecordToSave.save(opts), User.findOneAndUpdate({_id: userId}, {$inc: {opportunities: 0 - oppo}}, {session,new: true})]);
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

async function exchangeCoinToMoney(userId,coins) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = {session};
        const toPay = new ToPay({user:userId,coins:coins});
        const user = await User.findById(userId);
        if(user && user.coins < coins) throw 2; // not enough coin
        user.coins = user.coins - coins;
        await user.save();
        await toPay.save();
       // await user.save(opts);
       // await toPay.save(opts);

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

async function giveAwards(leagueSpec) {
    const session = await mongoose.startSession();


    session.startTransaction();
    try {
        const opts = {session};
        const league = await League.findOne({spec: leagueSpec});
        const coinUsers = await pagingUsers(league.spec,league.leadersNumber,1);
        const loyaltyUsers = await pagingUsers(league.spec,league.loyaltyGivensNumber,1);
        coinUsers.forEach(record => {
            User.findOneAndUpdate({_id: record.user},
                {$inc: {coins: league.awardCoinsNumber}});
        });
        loyaltyUsers.forEach(record => {
            User.findOneAndUpdate({_id: record.user},
                {$inc: {loyalty:league.awardLoyaltyNumber}});
        });
        await session.commitTransaction();
        session.endSession();
        return true;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow so calling function sees error
    }
} //admin  remember too add opts fot transactions working

function saveBoxTransaction(userId, username, transactionId, boxId) {
    const t = {
        user: userId,
        username: username,
        transactionId: transactionId,
        box: boxId
    };
    const transaction = new Box_Transaction(t);

    return new promise((resolve, reject) => {
        transaction.save((err, transaction) => {
            if (err)
                reject(err);
            else if (transaction)
                resolve(transaction);
        });
    })

} // used inside of buyBox

async function buyBox(userId, username, transactionId, boxId) {
    const box = await Box.findById(boxId);
    const [user, bt] = Promise.all([User.findOneAndUpdate({_id: userId}, {$inc: {opportunities: box.opportunities}}, {new: true}), saveBoxTransaction(userId, username, transactionId, boxId)])
    return {user: user, transaction: bt};

}  //not sure how the usage will be. from client or an payment api.


module.exports = {
    surroundingUsers,
    pagingUsers,
    userRank,
    surroundingUserRanks,
    edgeUsersRank,
    exchangeTotalOppoToLeagueOppo,
    exchangeCoinToMoney,
    buyBox,
    giveAwards
};