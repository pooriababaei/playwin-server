"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var mongoose_1 = __importDefault(require("mongoose"));
var globals_1 = require("../utils/globals");
var user_1 = __importDefault(require("../db/models/user"));
var scoreboard_1 = require("../db/models/scoreboard");
var weeklyLeader_1 = __importDefault(require("../db/models/weeklyLeader"));
var debug = debug_1.default('Scoreboard Controller:');
///////// helper functions
function surroundingUsersHelper(league, userId, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var Scoreboard, user, count, rank, _a, worse, better, page, userIndex, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    Scoreboard = scoreboard_1.scoreboardModel(league);
                    return [4 /*yield*/, Scoreboard.findOne({ user: userId })];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        throw 400;
                    }
                    return [4 /*yield*/, Scoreboard.find({
                            $or: [
                                { score: { $gt: user.score } },
                                { $and: [{ score: user.score }, { updatedAt: { $lt: user.updatedAt } }] }
                            ]
                        })
                            .sort({ score: -1, updatedAt: 1 })
                            .countDocuments()];
                case 2:
                    count = _b.sent();
                    rank = !count ? 1 : count + 1;
                    return [4 /*yield*/, Promise.all([
                            Scoreboard.find({
                                user: { $ne: userId },
                                $or: [
                                    { score: { $lt: user.score } },
                                    {
                                        $and: [{ score: user.score }, { updatedAt: { $gt: user.updatedAt } }]
                                    }
                                ]
                            })
                                .sort({ score: -1, updatedAt: 1 })
                                .limit(limit)
                                .populate({ path: 'user', select: 'username avatar' })
                                .lean(),
                            Scoreboard.find({
                                user: { $ne: userId },
                                $or: [
                                    { score: { $gt: user.score } },
                                    {
                                        $and: [{ score: user.score }, { updatedAt: { $lt: user.updatedAt } }]
                                    }
                                ]
                            })
                                .sort({ score: 1, updatedAt: -1 })
                                .limit(limit)
                                .populate({ path: 'user', select: 'username avatar' })
                                .lean()
                        ])];
                case 3:
                    _a = _b.sent(), worse = _a[0], better = _a[1];
                    page = better
                        .reverse()
                        .concat(user)
                        .concat(worse);
                    userIndex = page.findIndex(function (record) {
                        return record.user === userId;
                    });
                    for (i = 0; i < page.length; i++) {
                        page[i].rank = rank + (i - userIndex);
                    }
                    return [2 /*return*/, page];
            }
        });
    });
}
function userRankHelper(league, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var Scoreboard, user, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Scoreboard = scoreboard_1.scoreboardModel(league);
                    return [4 /*yield*/, Scoreboard.findOne({ user: userId })];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, Scoreboard.find({
                            $or: [
                                { score: { $gt: user.score } },
                                { $and: [{ score: user.score }, { updatedAt: { $lt: user.updatedAt } }] }
                            ]
                        })
                            .sort({ score: -1, updatedAt: 1 })
                            .countDocuments()];
                case 2:
                    count = _a.sent();
                    if (!count) {
                        return [2 /*return*/, 1];
                    }
                    return [2 /*return*/, count + 1];
            }
        });
    });
}
///////// end of helper functions
function modifyScoreboard(req, res) {
    var Scoreboard = scoreboard_1.scoreboardModel(req.league.collectionName);
    if (!Scoreboard) {
        return res.sendStatus(400);
    }
    if (req.params.hasOwnProperty('type')) {
        switch (parseInt(req.params.type)) {
            case 1: // reduce oppo  . this should be passed to play one game round in client
                Scoreboard.findOne({
                    user: req.userId
                }, function (err, result) {
                    if (err) {
                        return res.status(500).send();
                    }
                    if (!result) {
                        var record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            avatar: req.avatar,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save(function (err, record) {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            if (record) {
                                user_1.default.findOneAndUpdate({
                                    _id: req.userId
                                }, {
                                    $push: {
                                        participatedLeagues: req.league._id
                                    }
                                }, {
                                    new: true
                                }, function (err, user) {
                                    if (err) {
                                        debug(err);
                                    }
                                    if (user) {
                                        return res.status(200).send(record);
                                    }
                                });
                            }
                        });
                    }
                    else if (result && result.opportunity > 0) {
                        if (!req.league.maxOpportunity ||
                            (req.league.maxOpportunity &&
                                req.league.maxOpportunity > result.played)) {
                            var newRecord = result;
                            newRecord.opportunity = result.opportunity - 1;
                            newRecord.played = result.played + 1;
                            newRecord.save(function (err, result1) {
                                if (err) {
                                    return res.status(400).send(err);
                                }
                                else if (result1) {
                                    res.status(200).send(result1);
                                }
                            });
                        }
                        else {
                            return res.status(200).json({
                                code: 3
                            });
                        } // reach maximum number of game plays
                    }
                    else if (result && result.opportunity <= 0) {
                        return res.status(200).json({
                            code: 1
                        });
                    } // no opportunity
                });
                break;
            case 2: // make score
                if (req.score) {
                    var score_1 = req.score;
                    Scoreboard.findOne({
                        user: req.userId
                    }, function (err, result) {
                        if (err) {
                            return res.status(500).send();
                        }
                        if (!result) {
                            return res.status(400).json({
                                code: 1
                            }); // not legal
                        }
                        else if (result &&
                            result.opportunity >= 0 &&
                            result.score < score_1) {
                            var newRecord = result;
                            newRecord.score = score_1;
                            newRecord.updatedAt = new Date();
                            if (result.opportunity === 0) {
                                // it won't let user
                                newRecord.opportunity = result.opportunity - 1;
                            }
                            newRecord.save(function (err, result1) {
                                if (err) {
                                    return res.status(400).send(err);
                                }
                                else if (result1) {
                                    return res.status(200).send(result1);
                                }
                            });
                        }
                        else if (result &&
                            result.opportunity >= 0 &&
                            result.score >= score_1) {
                            return res.status(400).json({
                                code: 2
                            }); // score is less than  or equal record .it shouldn't have been sent
                        }
                        else if (result && result.opportunity < 0) {
                            // maybe not needed because we check it in reduceOppo mode
                            return res.status(200).json({
                                code: 1
                            });
                        } // not legal req
                    });
                }
                else {
                    return res.sendStatus(400);
                }
                break;
            case 3: // reduce and make score for leagues that opprtunity is new record NOT playing
                if (req.score) {
                    var score_2 = req.score;
                    Scoreboard.findOne({
                        user: req.userId
                    }, function (err, result) {
                        if (err) {
                            return res.sendStatus(500);
                        }
                        if (!result) {
                            var record = new Scoreboard({
                                user: req.userId,
                                username: req.username,
                                avatar: req.avatar,
                                score: score_2,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            });
                            record.save(function (err, record) {
                                if (err) {
                                    return res.status(500).send(err);
                                }
                                if (record) {
                                    user_1.default.findOneAndUpdate({
                                        _id: req.userId
                                    }, {
                                        $push: {
                                            participatedLeagues: req.league._id
                                        }
                                    }, {
                                        new: true
                                    }, function (err, user) {
                                        if (err) {
                                            debug(err);
                                        }
                                        if (user) {
                                            return res.status(200).send(record);
                                        }
                                    });
                                }
                            });
                        }
                        else if (result &&
                            result.opportunity > 0 &&
                            result.score < score_2) {
                            if (!req.league.maxOpportunity ||
                                (req.league.maxOpportunity &&
                                    req.league.maxOpportunity >= result.played)) {
                                var newRecord = result;
                                newRecord.score = score_2;
                                newRecord.opportunity = result.opportunity - 1;
                                newRecord.updatedAt = new Date();
                                newRecord.played = result.played + 1;
                                newRecord.save(function (err, result1) {
                                    if (err) {
                                        return res.status(400).send(err);
                                    }
                                    else if (result1) {
                                        res.status(200).send(result1);
                                    }
                                });
                            }
                            else {
                                return res.status(400).json({
                                    code: 3
                                });
                            } // reach maximum number game plays
                        }
                        else if (result &&
                            result.opportunity > 0 &&
                            result.score >= score_2) {
                            return res.status(400).json({
                                code: 2
                            }); // score is less than  or equal record .it shouldn't have been sent
                        }
                        else if (result && result.opportunity <= 0) {
                            return res.status(400).json({
                                code: 1
                            });
                        } // no oppotunity
                    });
                }
                else {
                    return res.sendStatus(400);
                }
                break;
            case 4:
                Scoreboard.findOne({
                    user: req.userId
                }, function (err, result) {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    if (result == null) {
                        var record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            played: 0,
                            avatar: req.avatar,
                            opportunity: req.league.maxOpportunity &&
                                req.league.maxOpportunity <
                                    req.league.dafaultOpportunity + globals_1.ADVERTISE_REWARD_COUPON
                                ? req.league.dafaultOpportunity
                                : req.league.dafaultOpportunity + globals_1.ADVERTISE_REWARD_COUPON,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save(function (err, record) {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            if (record) {
                                user_1.default.findOneAndUpdate({
                                    _id: req.userId
                                }, {
                                    $push: {
                                        participatedLeagues: req.league._id
                                    }
                                }, {
                                    new: true
                                }, function (err, user) {
                                    if (err) {
                                        debug(err);
                                    }
                                    if (user) {
                                        return res.status(200).send(record);
                                    }
                                });
                            }
                        });
                    }
                    else if (!req.league.maxOpportunity ||
                        (result &&
                            result.opportunity + result.played + globals_1.ADVERTISE_REWARD_COUPON <=
                                req.league.maxOpportunity)) {
                        var newRecord = result;
                        newRecord.opportunity =
                            result.opportunity + globals_1.ADVERTISE_REWARD_COUPON;
                        newRecord.save(function (err, result1) {
                            if (err) {
                                return res.status(400).send(err);
                            }
                            else if (result1) {
                                res.status(200).send(result1);
                            }
                        });
                    }
                    else {
                        return res.sendStatus(400);
                    }
                });
                break; // add oppo because of watching advertisement
        }
    }
    else {
        return res.sendStatus(400);
    }
}
exports.modifyScoreboard = modifyScoreboard;
function getUserRecord(req, res) {
    var Scoreboard = mongoose_1.default.model(req.params.collectionName);
    if (!Scoreboard) {
        return res.sendStatus(400);
    }
    Scoreboard.findOne({
        user: req.userId
    })
        .populate({
        path: 'user',
        select: 'username avatar'
    })
        .exec(function (err, result) {
        if (err) {
            return res.status(500).send();
        }
        else if (result) {
            return res.status(200).send(result);
        }
        else {
            return res.status(404).send();
        }
    });
}
exports.getUserRecord = getUserRecord;
function getUserRank(req, res) {
    var league = req.params.collectionName;
    userRankHelper(league, req.userId)
        .then(function (rank) {
        if (rank) {
            return res.status(200).json({
                rank: rank
            });
        }
        else {
            return res.status(404).send();
        }
    })
        .catch(function (err) {
        return res.status(404).send(err);
    });
}
exports.getUserRank = getUserRank;
function getSurroundingUsers(req, res) {
    var league = req.params.collectionName;
    var limit = parseInt(req.params.limit);
    surroundingUsersHelper(league, req.userId, limit)
        .then(function (page) {
        return res.status(200).json(page);
    })
        .catch(function (err) {
        if (err === 400) {
            return res.sendStatus(400);
        }
        return res.sendStatus(500);
    });
}
exports.getSurroundingUsers = getSurroundingUsers;
function getRecords(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var league, limit, page, Scoreboard, sort, count, records;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    league = req.params.collectionName;
                    limit = parseInt(req.query.perPage);
                    page = parseInt(req.query.page);
                    Scoreboard = mongoose_1.default.model(league);
                    sort = {
                        score: -1,
                        updatedAt: 1
                    };
                    return [4 /*yield*/, Scoreboard.find().countDocuments()];
                case 1:
                    count = _a.sent();
                    return [4 /*yield*/, Scoreboard.find()
                            .limit(limit)
                            .skip(limit * (page - 1))
                            .sort(sort)
                            .populate({
                            path: 'user',
                            select: 'username avatar'
                        })
                            .lean()];
                case 2:
                    records = _a.sent();
                    return [2 /*return*/, res
                            .set({
                            'Access-Control-Expose-Headers': 'x-total-count',
                            'x-total-count': count
                        })
                            .status(200)
                            .send(records)];
            }
        });
    });
}
exports.getRecords = getRecords;
function getWeeklyLeaders(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var pipeline;
        return __generator(this, function (_a) {
            pipeline = [
                {
                    $group: {
                        _id: '$user',
                        totalReward: {
                            $sum: '$reward'
                        }
                    }
                },
                {
                    $sort: {
                        totalReward: -1
                    }
                },
                {
                    $limit: 100
                },
                {
                    $lookup: {
                        from: user_1.default.collection.name,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        username: '$user.username',
                        totalReward: 1,
                        avatar: '$user.avatar'
                    }
                }
            ];
            weeklyLeader_1.default.aggregate(pipeline).exec(function (err, result) {
                if (err) {
                    debug(err);
                    return res.sendStatus(500);
                }
                res.status(200).json(result);
            });
            return [2 /*return*/];
        });
    });
}
exports.getWeeklyLeaders = getWeeklyLeaders;
function getTopUsers(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            user_1.default.find({}, 'avatar username totalReward')
                .limit(100)
                .skip(0)
                .sort({ totalReward: -1 })
                .exec(function (err, result) {
                if (err) {
                    return res.sendStatus(500);
                }
                return res.status(200).send(result);
            });
            return [2 /*return*/];
        });
    });
}
exports.getTopUsers = getTopUsers;
//# sourceMappingURL=scoreboardController.js.map