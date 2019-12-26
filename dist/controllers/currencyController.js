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
var toPay_1 = __importDefault(require("../db/models/toPay"));
var user_1 = __importDefault(require("../db/models/user"));
var league_1 = __importDefault(require("../db/models/league"));
var scoreboard_1 = require("../db/models/scoreboard");
var weeklyLeader_1 = __importDefault(require("../db/models/weeklyLeader"));
var achievement_1 = __importDefault(require("../db/models/achievement"));
var debug = debug_1.default('Currency Controller:');
///////// helper functions
function exchangecouponToLeagueOppoHelper(userId, oppo, league) {
    return __awaiter(this, void 0, void 0, function () {
        var session, opts, Scoreboard, userInfo, record, newRecord, newRecordToSave, _a, nr, user, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
                case 1:
                    session = _b.sent();
                    session.startTransaction();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 9, , 11]);
                    opts = { session: session };
                    Scoreboard = scoreboard_1.scoreboardModel(league.collectionName);
                    return [4 /*yield*/, user_1.default.findById(userId)];
                case 3:
                    userInfo = _b.sent();
                    if (!(userInfo && userInfo.coupon >= oppo)) return [3 /*break*/, 7];
                    return [4 /*yield*/, Scoreboard.findOne({ user: userId })];
                case 4:
                    record = _b.sent();
                    newRecord = null;
                    if (record == null) {
                        if (league.maxOpportunity &&
                            parseInt(oppo) + league.dafaultOpportunity > league.maxOpportunity) {
                            throw 2; //this is somehow a bad request. client mistake!!!
                        }
                        newRecord = {
                            user: userId,
                            played: 0,
                            avatar: userInfo.avatar,
                            opportunity: league.defaultOpportunity + oppo,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                    }
                    else if (record) {
                        if (league.maxOpportunity &&
                            record.played + oppo + record.opportunity > league.maxOpportunity) {
                            throw 2; // this is somehow a bad request. client mistake!!!
                        }
                        newRecord = record;
                        newRecord.opportunity =
                            record.opportunity < 0
                                ? record.opportunity + 1 + parseInt(oppo)
                                : record.opportunity + parseInt(oppo);
                    }
                    newRecordToSave = new Scoreboard(newRecord);
                    return [4 /*yield*/, Promise.all([
                            newRecordToSave.save(opts),
                            user_1.default.findOneAndUpdate({ _id: userId }, { $inc: { coupon: 0 - oppo } }, { session: session, new: true })
                        ])];
                case 5:
                    _a = _b.sent(), nr = _a[0], user = _a[1];
                    return [4 /*yield*/, session.commitTransaction()];
                case 6:
                    _b.sent();
                    session.endSession();
                    return [2 /*return*/, { record: nr, user: user }];
                case 7: throw 1;
                case 8: return [3 /*break*/, 11];
                case 9:
                    error_1 = _b.sent();
                    return [4 /*yield*/, session.abortTransaction()];
                case 10:
                    _b.sent();
                    session.endSession();
                    throw error_1; // Rethrow so calling function sees error
                case 11: return [2 /*return*/];
            }
        });
    });
}
function exchangerewardToMoneyHelper(userId, reward) {
    return __awaiter(this, void 0, void 0, function () {
        var session, opts, toPay, user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
                case 1:
                    session = _a.sent();
                    session.startTransaction();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 9]);
                    opts = { session: session };
                    toPay = new toPay_1.default({ user: userId, amount: reward * globals_1.REWARD_PRICE });
                    return [4 /*yield*/, user_1.default.findById(userId)];
                case 3:
                    user = _a.sent();
                    if (user && user.reward < reward) {
                        throw 2;
                    } // not enough reward
                    user.reward = user.reward - reward;
                    return [4 /*yield*/, user.save(opts)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, toPay.save(opts)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, session.commitTransaction()];
                case 6:
                    _a.sent();
                    session.endSession();
                    return [2 /*return*/, user.reward];
                case 7:
                    error_2 = _a.sent();
                    return [4 /*yield*/, session.abortTransaction()];
                case 8:
                    _a.sent();
                    session.endSession();
                    throw error_2; // Rethrow so calling function sees error
                case 9: return [2 /*return*/];
            }
        });
    });
}
function giveRewardsHelper(collectionName) {
    return __awaiter(this, void 0, void 0, function () {
        var session, opts_1, league_2, rewardUsers, _i, rewardUsers_1, record, wl, loyaltyUsers, newLeague, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.startSession()];
                case 1:
                    session = _a.sent();
                    session.startTransaction();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 14, , 16]);
                    opts_1 = { session: session };
                    return [4 /*yield*/, league_1.default.findOne({ collectionName: collectionName }).lean()];
                case 3:
                    league_2 = _a.sent();
                    if (!league_2) {
                        throw 404;
                    }
                    if (league_2.endTime >= Date.now() || league_2.rewarded === true) {
                        throw 400;
                    }
                    return [4 /*yield*/, getRecordsHelper(league_2.collectionName, league_2.leadersNumber, 1)];
                case 4:
                    rewardUsers = _a.sent();
                    _i = 0, rewardUsers_1 = rewardUsers;
                    _a.label = 5;
                case 5:
                    if (!(_i < rewardUsers_1.length)) return [3 /*break*/, 9];
                    record = rewardUsers_1[_i];
                    return [4 /*yield*/, user_1.default.findOneAndUpdate({ _id: record.user }, { $inc: { reward: league_2.reward, totalReward: league_2.reward } }, opts_1)];
                case 6:
                    _a.sent();
                    wl = new weeklyLeader_1.default({
                        user: record.user,
                        reward: league_2.reward
                    });
                    return [4 /*yield*/, wl.save().catch(function () { })];
                case 7:
                    _a.sent(); // not so important to impact transaction
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9:
                    if (!(league_2.loyaltyGiven && league_2.loyaltyGiven !== 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, getRecordsHelper(league_2.collectionName, league_2.loyaltyGiven, 1)];
                case 10:
                    loyaltyUsers = _a.sent();
                    loyaltyUsers.forEach(function (record) {
                        user_1.default.findOneAndUpdate({ _id: record.user }, { $inc: { loyalty: league_2.loyaltyReward } }, opts_1);
                    });
                    _a.label = 11;
                case 11: return [4 /*yield*/, league_1.default.findOneAndUpdate({ collectionName: collectionName }, { rewarded: true }, { session: session, new: true })];
                case 12:
                    newLeague = _a.sent();
                    return [4 /*yield*/, session.commitTransaction()];
                case 13:
                    _a.sent();
                    session.endSession();
                    return [2 /*return*/, newLeague];
                case 14:
                    error_3 = _a.sent();
                    return [4 /*yield*/, session.abortTransaction()];
                case 15:
                    _a.sent();
                    session.endSession();
                    throw error_3; // Rethrow so calling function sees error
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.giveRewardsHelper = giveRewardsHelper;
function getRecordsHelper(league, limit, page) {
    return new Promise(function (resolve, reject) {
        var Scoreboard = mongoose_1.default.model(league);
        var sort = { score: -1, updatedAt: 1 };
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
///////// helper functions
function exchangecouponToLeagueOppo(req, res) {
    var league = req.league;
    var oppo = req.params.opportunity;
    exchangecouponToLeagueOppoHelper(req.userId, oppo, league)
        .then(function (result) {
        res.status(200).json(result);
    })
        .catch(function (err) {
        if (err === 1 || err === 2) {
            return res.status(400).send({
                code: err
            });
        }
        res.status(500).send(err.toString());
    }); // if throws 1 not enough oppo.
    // if throws 2 maxOpportunity bound(client mistake).
    // otherwise returns updated user and record
}
exports.exchangecouponToLeagueOppo = exchangecouponToLeagueOppo;
function exchangerewardToMoney(req, res) {
    var reward = parseInt(req.params.reward);
    try {
        if (isNaN(reward) || reward <= 0) {
            return res.sendStatus(400);
        }
        if (reward < globals_1.REWARD_TRESHOLD_TO_EXCHANGE) {
            return res.status(400).send({
                code: 1
            });
        } // Less than treshold for exchange. somehow is the client mistake.
        exchangerewardToMoneyHelper(req.userId, reward)
            .then(function (result) {
            res.status(200).send(result.toString());
        })
            .catch(function (err) {
            if (err === 2) {
                return res.status(400).send({
                    code: err
                });
            }
            res.sendStatus(500);
        });
    }
    catch (e) {
        return res.sendStatus(500);
    }
}
exports.exchangerewardToMoney = exchangerewardToMoney;
function giveRewards(req, res) {
    var collectionName = req.params.collectionName;
    giveRewardsHelper(collectionName)
        .then(function (result) {
        return res.status(200).send(result);
    })
        .catch(function (err) {
        debug(err);
        return res.sendStatus(500);
    });
}
exports.giveRewards = giveRewards;
function achievements(req, res) {
    achievement_1.default.find({}, function (err, achievements) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(achievements);
    });
}
exports.achievements = achievements;
function achieve(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var achievementId, achievement, user, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    achievementId = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, achievement_1.default.findById(achievementId).lean()];
                case 2:
                    achievement = _a.sent();
                    if (!achievement) {
                        return [2 /*return*/, res.sendStatus(400)];
                    }
                    return [4 /*yield*/, user_1.default.findOne({
                            username: req.username
                        })];
                case 3:
                    user = _a.sent();
                    if (!user ||
                        (user.achievements != null &&
                            user.achievements.indexOf(achievementId) >= 0)) {
                        return [2 /*return*/, res.sendStatus(400)];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [2 /*return*/, res.sendStatus(400)];
                case 5:
                    user_1.default.findOneAndUpdate({
                        username: req.username
                    }, {
                        $push: {
                            achievements: achievementId
                        }
                    }, {
                        new: true
                    }, function (err, updatedUser) {
                        if (err) {
                            return res.sendStatus(500);
                        }
                        if (!updatedUser) {
                            return res.sendStatus(400);
                        }
                        return res.status(200).send(updatedUser);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.achieve = achieve;
//# sourceMappingURL=currencyController.js.map