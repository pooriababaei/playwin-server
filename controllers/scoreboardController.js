const mongoose = require('mongoose');
const User = mongoose.model('user');

const dbFunctions = require('../utils/dbFunctions');
const debug = require('debug')('Scoreboard Controller:');

function modifyScoreboard (req, res) {
    let Scoreboard = mongoose.model(req.league.spec);

    if (!Scoreboard) return res.sendStatus(400);

    if (req.params.hasOwnProperty('type')) {
        switch (parseInt(req.params.type)) {
            case 1 :  // reduce oppo  . this should be passed to play one game round in client
                Scoreboard.findOne({user: req.userId}, (err, result) => {
                    if (err)
                        return res.status(500).send();

                    if (!result) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            avatar: req.avatar,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err)
                                return res.status(500).send(err);
                            if (record)
                                User.findOneAndUpdate({_id: req.userId}, {
                                    $push: {participated_leagues: req.league._id}
                                }, {new: true}, function (err, user) {
                                    if (err) debug(err);
                                    if (user)
                                        return res.status(200).send(record);
                                });


                        });
                    }

                    else if (result && result.opportunities > 0) {
                        if (!req.league.max_opportunities || (req.league.max_opportunities && req.league.max_opportunities > result.played)) {
                            let newRecord = result;
                            newRecord.opportunities = result.opportunities - 1;
                            newRecord.played = result.played + 1;
                            newRecord.save((err, result1) => {
                                if (err)
                                    return res.status(400).send(err);

                                else if (result1)
                                    res.status(200).send(result1);
                            });
                        }
                        else
                            return res.status(200).json({code: 3}); //reach maximum number of game plays

                    }

                    else if (result && result.opportunities <= 0)
                        return res.status(200).json({code: 1}); // no opportunity

                });
                break;
            case 2 :  // make score
                if (req.query.hasOwnProperty('score')) {
                    const score = req.query.score;
                    Scoreboard.findOne({user: req.userId}, (err, result) => {
                            if (err)
                                return res.status(500).send();

                            if (!result) {
                                return res.status(400).json({code: 1});  // not legal
                            }

                            else if (result && result.opportunities >= 0 && result.score < score) {
                                let newRecord = result;
                                newRecord.score = score;
                                newRecord.updatedAt = Date.now();
                                if (result.opportunities == 0) //it won't let user
                                    newRecord.opportunities = result.opportunities - 1;

                                newRecord.save((err, result1) => {
                                    if (err)
                                        return res.status(400).send(err);

                                    else if (result1)
                                        return res.status(200).send(result1);
                                });
                            }

                            else if (result && result.opportunities >= 0 && result.score >= score) {
                                return res.status(400).json({code: 2}); // score is less than  or equal record .it shouldn't have been sent
                            }

                            else if (result && result.opportunities < 0)  //maybe not needed because we check it in reduceOppo mode
                                return res.status(200).json({code: 1});  // not legal req

                        }
                    );
                }
                else
                    return res.sendStatus(400);
                break;

            case 3 :  // reduce and make score for leagues that opprtunity is new record NOT playing
                if (req.query.hasOwnProperty('score')) {
                    const score = req.query.score;
                    Scoreboard.findOne({user: req.userId}, (err, result) => {
                        if (err)
                            return res.sendStatus(500);

                        if (!result) {
                            const record = new Scoreboard({
                                user: req.userId,
                                username: req.username,
                                avatar: req.avatar,
                                score: score,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            });
                            record.save((err, record) => {
                                if (err)
                                    return res.status(500).send(err);
                                if (record)
                                    User.findOneAndUpdate({_id: req.userId}, {
                                        $push: {participated_leagues: req.league._id}
                                    }, {new: true}, function (err, user) {
                                        if (err) debug(err);
                                        if (user)
                                            return res.status(200).send(record);
                                    });


                            });
                        }

                        else if (result && result.opportunities > 0 && result.score < score) {
                            if (!req.league.max_opportunities || (req.league.max_opportunities && req.league.max_opportunities >= result.played)) {
                                let newRecord = result;
                                newRecord.score = score;
                                newRecord.opportunities = result.opportunities - 1;
                                newRecord.updatedAt = Date.now();
                                newRecord.played = result.played + 1;

                                newRecord.save((err, result1) => {
                                    if (err)
                                        return res.status(400).send(err);

                                    else if (result1)
                                        res.status(200).send(result1);
                                });
                            }
                            else
                                return res.status(400).json({code: 3}); //reach maximum number game plays
                        }
                        else if (result && result.opportunities > 0 && result.score >= score) {
                            return res.status(400).json({code: 2}); // score is less than  or equal record .it shouldn't have been sent
                        }

                        else if (result && result.opportunities <= 0)
                            return res.status(400).json({code: 1});  //no oppotunity

                    });
                }
                else return res.sendStatus(400);
                break;
            case 4 :
                Scoreboard.findOne({user: req.userId}, (err, result) => {
                    if (err)
                        return res.sendStatus(500);
                    if (result == null) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            played:0,
                            avatar: req.avatar,
                            opportunities: (req.league.max_opportunities && req.league.max_opportunities < req.league.default_opportunities + ADVERTISE_AWARD_OPPO) ? req.league.default_opportunities : req.league.default_opportunities + ADVERTISE_AWARD_OPPO,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err)
                                return res.status(500).send(err);
                            if (record)
                                User.findOneAndUpdate({_id: req.userId}, {
                                    $push: {participated_leagues: req.league._id}
                                }, {new: true}, function (err, user) {
                                    if (err) debug(err);
                                    if (user)
                                        return res.status(200).send(record);
                                });
                        });
                    }
                    else if (!req.league.max_opportunities || result && result.opportunities + result.played + ADVERTISE_AWARD_OPPO <=req.league.max_opportunities) {
                        let newRecord = result;
                        newRecord.opportunities = result.opportunities + ADVERTISE_AWARD_OPPO;
                        newRecord.save((err, result1) => {
                            if (err)
                                return res.status(400).send(err);

                            else if (result1)
                                res.status(200).send(result1);
                        });

                    }
                    else return res.sendStatus(400);
                });
                break; //add oppo because for watching advertisement
        }

    }
    else
        return res.sendStatus(400);
}

function userRecord (req, res) {
    let Scoreboard = mongoose.model(req.params.leagueSpec);
    if (!Scoreboard) return res.sendStatus(400);

    Scoreboard.findOne({user: req.userId}, (err, result) => {
        if (err)
            return res.status(500).send();
        else if (result)
            return res.status(200).send(result);
        else
            return res.status(404).send();

    });
}

function userRank (req, res) {
    const league = req.params.leagueSpec;
    dbFunctions.userRank(league, req.userId).then(rank => {
        if (rank)
            return res.status(200).json({rank: rank});
        else
            return res.status(404).send();
    }).catch(err => {
        return res.status(404).send(err);
    })
}

function surroundingUserRanks (req, res) {
    const league = req.params.leagueSpec;
    const limit = parseInt(req.params.limit);

    dbFunctions.surroundingUserRanks(league, req.userId, limit).then(page => {
        return res.status(200).json(page);
    }).catch(err => {
        return res.status(500).send(err);
    })
}

function surroundingUsers (req,res) {
    const id = req.userId;
    const league = req.params.leagueSpec;
    const limit = parseInt(req.params.limit);
    debug(limit);
    dbFunctions.surroundingUsers(league, id, limit).then(result => {
        return res.status(200).json(result)
    }).catch(err => {
        debug(err);
        return res.status(500).send();
    });
}

function edgeUsersRank (req,res) {
    const league = req.params.leagueSpec;
    const edge1 = req.query.edge1;
    const edge2 = req.query.edge2;
    dbFunctions.edgeUsersRank(league,edge1,edge2).then(result =>{
        return res.status(200).send(result);
    }).catch(err =>{
        return res.status(500).send(err);
    });
}

async function pagingUsers (req,res) {
    const league = req.params.leagueSpec;
    const limit = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
   // let filter = req.query.filter;
   // if (filter !== null && Object.keys(filter).length !== 0 && obj.constructor === Object)
    //    filter = JSON.parse(req.query.filter);

    const Scoreboard = mongoose.model(league);
    const sort = {score: -1, updatedAt: 1};
    // if (filter && filter.username) query.find({username: { $regex: '.*' + filter.username + '.*' } });
    // if (filter && filter.phoneNumber) query.find({phoneNumber: { $regex: '.*' + filter.phoneNumber + '.*' }});
    let count = await Scoreboard.find().countDocuments();
    const records = await Scoreboard.find()
                    .limit(limit)
                    .skip(limit * (page - 1))
                    .sort(sort)
                    .lean();
    return res.set({
        'Access-Control-Expose-Headers': 'x-total-count',
        'x-total-count': count
    }).status(200).send(records);
}

module.exports = {
    modifyScoreboard, userRank, userRecord, surroundingUserRanks, surroundingUsers, edgeUsersRank, pagingUsers
};
