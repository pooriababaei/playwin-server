import Debug from 'debug';
import mongoose from 'mongoose';
import {ADVERTISE_AWARD_COUPON} from '../utils/globals';
const User = mongoose.model('user');
const WeeklyLeader = mongoose.model('weeklyLeader');
const debug = Debug('Scoreboard Controller:');

///////// helper functions
async function surroundingUsersHelper(league, userId, limit) {
    const Scoreboard = mongoose.model(league);
    const user = await Scoreboard.findOne({user: userId});
    if (!user) { throw 400; }
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
        }).sort({score: -1, updatedAt: 1}).limit(limit).populate({path: 'user', select: 'username avatar'}).lean(),

        Scoreboard.find({
            user: {$ne: userId},
            $or: [{score: {$gt: user.score}},
                {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
        }).sort({score: 1, updatedAt: -1}).limit(limit).populate({path: 'user', select: 'username avatar'}).lean(),
    ]);

    let page = better.reverse().concat(user).concat(worse);
    const userIndex = page.findIndex((record) => {
        return record.user === userId;
    });

    for (let i = 0; i < page.length; i++) {
        page[i].rank = rank + (i - userIndex);
    }
    return page;
}
async function userRankHelper(league, userId) {

    const Scoreboard = mongoose.model(league);
    const user = await Scoreboard.findOne({user: userId});
    const count = await Scoreboard.find({
        $or: [{score: {$gt: user.score}},
            {$and: [{score: user.score}, {updatedAt: {$lt: user.updatedAt}}]}]
    }).sort({score: -1, updatedAt: 1}).countDocuments();

    if (!count) {
        return 1;
    }
    return count + 1;
}
///////// end of helper functions

export function modifyScoreboard(req, res) {
    const Scoreboard = mongoose.model(req.league.collectionName);

    if (!Scoreboard) {
        return res.sendStatus(400);
    }

    if (req.params.hasOwnProperty('type')) {
        switch (parseInt(req.params.type)) {
            case 1: // reduce oppo  . this should be passed to play one game round in client
                Scoreboard.findOne({
                    user: req.userId
                }, (err, result) => {
                    if (err) {
                        return res.status(500).send();
                    }
                    if (!result) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            avatar: req.avatar,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            if (record) {
                                User.findOneAndUpdate({
                                    _id: req.userId
                                }, {
                                    $push: {
                                        participatedLeagues: req.league._id
                                    }
                                }, {
                                    new: true
                                }, (err, user) => {
                                    if (err) {
                                        debug(err);
                                    }
                                    if (user) {
                                        return res.status(200).send(record);
                                    }
                                });
                            }
                        });
                    } else if (result && result.opportunities > 0) {
                        if (!req.league.maxOpportunities || (req.league.maxOpportunities &&
                                req.league.maxOpportunities > result.played)) {
                            let newRecord = result;
                            newRecord.opportunities = result.opportunities - 1;
                            newRecord.played = result.played + 1;
                            newRecord.save((err, result1) => {
                                if (err) {
                                    return res.status(400).send(err);
                                } else if (result1) {
                                    res.status(200).send(result1);
                                }
                            });
                        } else {
                            return res.status(200).json({
                                code: 3
                            });
                        } // reach maximum number of game plays

                    } else if (result && result.opportunities <= 0) {
                        return res.status(200).json({
                            code: 1
                        });
                    } // no opportunities

                });
                break;
            case 2: // make score
                if (req.score) {
                    const score = req.score;
                    Scoreboard.findOne({
                        user: req.userId
                    }, (err, result) => {
                        if (err) {
                            return res.status(500).send();
                        }

                        if (!result) {
                            return res.status(400).json({
                                code: 1
                            }); // not legal
                        } else if (result && result.opportunities >= 0 && result.score < score) {
                            let newRecord = result;
                            newRecord.score = score;
                            newRecord.updatedAt = Date.now();
                            if (result.opportunities === 0) { // it won't let user
                                newRecord.opportunities = result.opportunities - 1;
                            }

                            newRecord.save((err, result1) => {
                                if (err) {
                                    return res.status(400).send(err);
                                } else if (result1) {
                                    return res.status(200).send(result1);
                                }
                            });
                        } else if (result && result.opportunities >= 0 && result.score >= score) {
                            return res.status(400).json({
                                code: 2
                            }); // score is less than  or equal record .it shouldn't have been sent
                        } else if (result && result.opportunities < 0) { // maybe not needed because we check it in reduceOppo mode
                            return res.status(200).json({
                                code: 1
                            });
                        } // not legal req

                    });
                } else {
                    return res.sendStatus(400);
                }
                break;

            case 3: // reduce and make score for leagues that opprtunity is new record NOT playing
                if (req.score) {
                    const score = req.score;
                    Scoreboard.findOne({
                        user: req.userId
                    }, (err, result) => {
                        if (err) {
                            return res.sendStatus(500);
                        }

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
                                if (err) {
                                    return res.status(500).send(err);
                                }
                                if (record) {
                                    User.findOneAndUpdate({
                                        _id: req.userId
                                    }, {
                                        $push: {
                                            participatedLeagues: req.league._id
                                        }
                                    }, {
                                        new: true
                                    }, (err, user) => {
                                        if (err) {
                                            debug(err);
                                        }
                                        if (user) {
                                            return res.status(200).send(record);
                                        }
                                    });
                                }
                            });
                        } else if (result && result.opportunities > 0 && result.score < score) {
                            if (!req.league.maxOpportunities || (req.league.maxOpportunities &&
                                    req.league.maxOpportunities >= result.played)) {
                                let newRecord = result;
                                newRecord.score = score;
                                newRecord.opportunities = result.opportunities - 1;
                                newRecord.updatedAt = Date.now();
                                newRecord.played = result.played + 1;

                                newRecord.save((err, result1) => {
                                    if (err) {
                                        return res.status(400).send(err);
                                    } else if (result1) {
                                        res.status(200).send(result1);
                                    }
                                });
                            } else {
                                return res.status(400).json({
                                    code: 3
                                });
                            } // reach maximum number game plays
                        } else if (result && result.opportunities > 0 && result.score >= score) {
                            return res.status(400).json({
                                code: 2
                            }); // score is less than  or equal record .it shouldn't have been sent
                        } else if (result && result.opportunities <= 0) {
                            return res.status(400).json({
                                code: 1
                            });
                        } // no oppotunity
                    });
                } else {
                    return res.sendStatus(400);
                }
                break;
            case 4:
                Scoreboard.findOne({
                    user: req.userId
                }, (err, result) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    if (result == null) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            played: 0,
                            avatar: req.avatar,
                            opportunities: (req.league.maxOpportunities && req.league.maxOpportunities < req.league.dafaultOpportunities + ADVERTISE_AWARD_COUPON) ? req.league.dafaultOpportunities : req.league.dafaultOpportunities + ADVERTISE_AWARD_COUPON,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            if (record) {
                                User.findOneAndUpdate({
                                    _id: req.userId
                                }, {
                                    $push: {
                                        participatedLeagues: req.league._id
                                    }
                                }, {
                                    new: true
                                }, (err, user) => {
                                    if (err) {
                                        debug(err);
                                    }
                                    if (user) {
                                        return res.status(200).send(record);
                                    }
                                });
                            }
                        });
                    } else if (!req.league.maxOpportunities || result && result.opportunities + result.played + ADVERTISE_AWARD_COUPON <= req.league.maxOpportunities) {
                        let newRecord = result;
                        newRecord.opportunities = result.opportunities + ADVERTISE_AWARD_COUPON;
                        newRecord.save((err, result1) => {
                            if (err) {
                                return res.status(400).send(err);
                            } else if (result1) {
                                res.status(200).send(result1);
                            }
                        });

                    } else {
                        return res.sendStatus(400);
                    }
                });
                break; // add oppo because of watching advertisement
        }
    } else {
        return res.sendStatus(400);
    }
}

export function getUserRecord(req, res) {
    const Scoreboard = mongoose.model(req.params.collectionName);
    if (!Scoreboard) {
        return res.sendStatus(400);
    }

    Scoreboard.findOne({
        user: req.userId
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else if (result) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send();
        }

    });
}

export function getUserRank(req, res) {
    const league = req.params.collectionName;
    userRankHelper(league, req.userId).then((rank) => {
        if (rank) {
            return res.status(200).json({
                rank
            });
        } else {
            return res.status(404).send();
        }
    }).catch((err) => {
        return res.status(404).send(err);
    });
}

export function getSurroundingUsers(req, res) {
    const league = req.params.collectionName;
    const limit = parseInt(req.params.limit);

    surroundingUsersHelper(league, req.userId, limit).then((page) => {
        return res.status(200).json(page);
    }).catch((err) => {
        if (err === 400) {
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    })
}

export async function getRecords(req, res) {
    const league = req.params.collectionName;
    const limit = parseInt(req.query.perPage);
    const page = parseInt(req.query.page);
    // let filter = req.query.filter;
    // if (filter !== null && Object.keys(filter).length !== 0 && obj.constructor === Object)
    //    filter = JSON.parse(req.query.filter);

    const Scoreboard = mongoose.model(league);
    const sort = {
        score: -1,
        updatedAt: 1
    };
    // if (filter && filter.username) query.find({username: { $regex: '.*' + filter.username + '.*' } });
    // if (filter && filter.phoneNumber) query.find({phoneNumber: { $regex: '.*' + filter.phoneNumber + '.*' }});
    let count = await Scoreboard.find().countDocuments();
    const records = await Scoreboard.find()
        .limit(limit)
        .skip(limit * (page - 1))
        .sort(sort)
        .populate({
            path: 'user',
            select: 'username avatar'
        })
        .lean();
    return res.set({
        'Access-Control-Expose-Headers': 'x-total-count',
        'x-total-count': count
    }).status(200).send(records);
}

export async function getWeeklyLeaders(req, res) {
    const pipeline = [{
            $group: {
                _id: '$user',
                weeklyCoins: {
                    $sum: '$coins'
                }
            }
        },
        {
            $sort: {
                weeklyCoins: -1
            }
        },
        {
            $limit: 100
        },
        {
            $lookup: {
                from: User.collection.name,
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $project: {
                _id: 0,
                username: '$user.username',
                weeklyCoins: 1,
                avatar: '$user.avatar'
            }
        }
    ];

    WeeklyLeader.aggregate(pipeline)
        .exec((err, result) => {
            if (err) {
                debug(err);
                return res.sendStatus(500);
            }
            res.status(200).json(result);
        });
}

export async function getTopUsers(req,res) {
    User.find({}, 'avatar username totalCoins')
    .limit(100)
    .skip(0)
    .sort({totalCoins: -1})
    .exec((err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(result);
    });
}