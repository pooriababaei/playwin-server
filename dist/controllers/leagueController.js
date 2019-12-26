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
var adm_zip_1 = __importDefault(require("adm-zip"));
var debug_1 = __importDefault(require("debug"));
var mongoose_1 = __importDefault(require("mongoose"));
var node_schedule_1 = __importDefault(require("node-schedule"));
var path_1 = __importDefault(require("path"));
var rimraf_1 = __importDefault(require("rimraf"));
var underscore_1 = __importDefault(require("underscore"));
var url_join_1 = __importDefault(require("url-join"));
var scoreboard_1 = require("../db/models/scoreboard");
var currencyController_1 = require("./currencyController");
var jobController_1 = require("./jobController");
var league_1 = __importDefault(require("../db/models/league"));
var job_1 = __importDefault(require("../db/models/job"));
var debug = debug_1.default('League Controller:');
function getLeagues(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var leagueState, sort, filter, query, leagues, _i, leagues_1, league, Scoreboard, _a, leadersPlayedTimes, sum, _b, leadersPlayedTimes_1, record;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    leagueState = {};
                    sort = null;
                    filter = null;
                    if (req.query.sort) {
                        sort = JSON.parse(req.query.sort);
                    }
                    if (req.query.filter) {
                        filter = JSON.parse(req.query.filter);
                    }
                    if (filter && filter.running) {
                        if (filter.running === 1) {
                            // up leagues
                            leagueState.endTime = {
                                $gte: Date.now()
                            };
                            leagueState.startTime = {
                                $lte: Date.now()
                            };
                        }
                        else if (filter.running === 2) {
                            // future leagues
                            leagueState.startTime = {
                                $gt: Date.now()
                            };
                        }
                        else if (filter.running === 3) {
                            // past leagues
                            leagueState.endTime = {
                                $lt: Date.now()
                            };
                        }
                    }
                    if (filter && filter.available != null) {
                        leagueState.available = filter.available;
                    }
                    if (filter && filter.kind) {
                        leagueState.kind = filter.kind;
                    }
                    query = league_1.default.find(leagueState);
                    if (sort) {
                        query.sort([sort]);
                    }
                    return [4 /*yield*/, query.lean()];
                case 1:
                    leagues = _c.sent();
                    if (!leagues) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    _i = 0, leagues_1 = leagues;
                    _c.label = 2;
                case 2:
                    if (!(_i < leagues_1.length)) return [3 /*break*/, 6];
                    league = leagues_1[_i];
                    if (!(league.startTime < Date.now() &&
                        mongoose_1.default.modelNames().includes(league.collectionName))) return [3 /*break*/, 5];
                    Scoreboard = scoreboard_1.scoreboardModel(league.collectionName);
                    _a = league;
                    return [4 /*yield*/, Scoreboard.find().countDocuments()];
                case 3:
                    _a.playersNumber = _c.sent();
                    return [4 /*yield*/, Scoreboard.find({}, 'played')
                            .limit(league.leadersNumber)
                            .skip(0)
                            .sort({
                            score: -1,
                            updatedAt: 1
                        })
                            .lean()];
                case 4:
                    leadersPlayedTimes = _c.sent();
                    sum = 0;
                    for (_b = 0, leadersPlayedTimes_1 = leadersPlayedTimes; _b < leadersPlayedTimes_1.length; _b++) {
                        record = leadersPlayedTimes_1[_b];
                        sum += record.played;
                    }
                    if (league.playersNumber < league.leadersNumber &&
                        league.playersNumber !== 0)
                        league.leadersAveragePlayedTimes = sum / league.playersNumber;
                    else if (league.leadersNumber !== 0)
                        league.leadersAveragePlayedTimes = sum / league.leadersNumber;
                    else
                        league.leadersAveragePlayedTimes = 0;
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, res
                        .set({
                        'Access-Control-Expose-Headers': 'x-total-count',
                        'x-total-count': leagues.length
                    })
                        .status(200)
                        .json(leagues)];
            }
        });
    });
}
exports.getLeagues = getLeagues;
function getLeague(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var league, Scoreboard, _a, leadersPlayedTimes, sum, _i, leadersPlayedTimes_2, record, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, league_1.default.findById(req.params.id).lean()];
                case 1:
                    league = _b.sent();
                    if (!league) {
                        return [2 /*return*/, res.sendStatus(404)];
                    }
                    if (!(league.startTime < Date.now() &&
                        mongoose_1.default.modelNames().includes(league.collectionName))) return [3 /*break*/, 4];
                    Scoreboard = mongoose_1.default.model(league.collectionName);
                    _a = league;
                    return [4 /*yield*/, Scoreboard.find().countDocuments()];
                case 2:
                    _a.playersNumber = _b.sent();
                    return [4 /*yield*/, Scoreboard.find({}, 'played')
                            .limit(league.leadersNumber)
                            .skip(0)
                            .sort({
                            score: -1,
                            updatedAt: 1
                        })
                            .lean()];
                case 3:
                    leadersPlayedTimes = _b.sent();
                    sum = 0;
                    for (_i = 0, leadersPlayedTimes_2 = leadersPlayedTimes; _i < leadersPlayedTimes_2.length; _i++) {
                        record = leadersPlayedTimes_2[_i];
                        sum += record.played;
                    }
                    if (league.playersNumber < league.leadersNumber &&
                        league.playersNumber !== 0)
                        league.leadersAveragePlayedTimes = sum / league.playersNumber;
                    else if (league.leadersNumber !== 0)
                        league.leadersAveragePlayedTimes = sum / league.leadersNumber;
                    else
                        league.leadersAveragePlayedTimes = 0;
                    _b.label = 4;
                case 4: return [2 /*return*/, res.status(200).send(league)];
                case 5:
                    e_1 = _b.sent();
                    return [2 /*return*/, res.sendStatus(500)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.getLeague = getLeague;
function createLeague(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var images, mainImage, gif, game, gameZip, info, zip, index, i, temp, league, job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    images = [];
                    info = underscore_1.default.pick(req.body, 'name', 'collectionName', 'description', 'startTime', 'kind', 'endTime', 'available', 'defaultOpportunity', 'maxOpportunity', 'html', 'color', 'leadersNumber', 'loyaltyGiven', 'reward', 'loyaltyReward');
                    info.defaultOpportunity = info.defaultOpportunity - 1;
                    if (req.files && req.files.mainImage) {
                        mainImage =
                            '/public/leagues/' +
                                req.body.collectionName +
                                '/' +
                                req.files.mainImage[0].filename;
                        info.mainImage = mainImage;
                    }
                    if (req.files && req.files.gif) {
                        gif =
                            '/public/leagues/' +
                                req.body.collectionName +
                                '/' +
                                req.files.gif[0].filename;
                        info.gif = gif;
                    }
                    if (req.files && req.files.game) {
                        zip = new adm_zip_1.default(path_1.default.join(__dirname, '../../public/leagues/', req.body.collectionName, req.files.game[0].originalname));
                        zip.extractAllTo(path_1.default.join(__dirname, '../../public/leagues/', req.body.collectionName), 
                        /*overwrite*/ true);
                        index = info.html ? info.html : 'index.html';
                        game = url_join_1.default('/public/leagues', req.body.collectionName, req.files.game[0].originalname.split('.')[0], index);
                        gameZip = url_join_1.default('/public/leagues', req.body.collectionName, req.files.game[0].originalname);
                        info.game = game;
                        info.gameZip = gameZip;
                    }
                    if (req.files && req.files.images) {
                        for (i = 0; i < req.files.images.length; i++) {
                            temp = '/public/leagues/' +
                                req.body.collectionName +
                                '/images/' +
                                req.files.images[i].filename;
                            images.push(temp);
                        }
                        info.images = images;
                    }
                    return [4 /*yield*/, new league_1.default(info).save().catch(function () { })];
                case 1:
                    league = _a.sent();
                    if (!league) {
                        return [2 /*return*/, res.sendStatus(400)];
                    }
                    scoreboard_1.scoreboardModel(league.collectionName, league.defaultOpportunity);
                    job = {
                        property: league.collectionName,
                        type: 'reward',
                        fireTime: new Date(league.endTime),
                        processOwner: process.env.NODE_APP_INSTANCE != null
                            ? process.env.NODE_APP_INSTANCE
                            : null
                    };
                    jobController_1.createJobHelper(job, currencyController_1.giveRewardsHelper, true)
                        .then(function () { return res.status(200).send(league); })
                        .catch(function (err) {
                        debug(err);
                        return res.sendStatus(500);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.createLeague = createLeague;
function updateLeague(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var images, mainImage, gif, game, gameZip, info, zip, index, i, temp, league, shouldSchedule, oldEndTime, newEndTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    images = [];
                    info = underscore_1.default.pick(req.body, 'name', 'collectionName', 'description', 'startTime', 'endTime', 'available', 'defaultOpportunity', 'maxOpportunity', 'html', 'color', 'leadersNumber', 'loyaltyGiven', 'reward', 'loyaltyReward');
                    if (info.defaultOpportunity) {
                        info.defaultOpportunity = info.defaultOpportunity - 1;
                    }
                    if (req.files && req.files.mainImage) {
                        mainImage =
                            '/public/leagues/' +
                                req.body.collectionName +
                                '/' +
                                req.files.mainImage[0].filename;
                        info.mainImage = mainImage;
                    }
                    if (req.files && req.files.gif) {
                        gif =
                            '/public/leagues/' +
                                req.body.collectionName +
                                '/' +
                                req.files.gif[0].filename;
                        info.gif = gif;
                    }
                    if (req.files && req.files.game) {
                        zip = new adm_zip_1.default(path_1.default.join(__dirname, '../../public/leagues/', req.body.collectionName, req.files.game[0].originalname));
                        zip.extractAllTo(path_1.default.join(__dirname, '../../public/leagues/', req.body.collectionName), 
                        /*overwrite*/ true);
                        index = info.html ? info.html : 'index.html';
                        game = url_join_1.default('/public/leagues', req.body.collectionName, req.files.game[0].originalname.split('.')[0], index);
                        gameZip = url_join_1.default('/public/leagues', req.body.collectionName, req.files.game[0].originalname);
                        info.game = game;
                        info.gameZip = gameZip;
                    }
                    if (req.files && req.files.images) {
                        for (i = 0; i < req.files.images.length; i++) {
                            temp = '/public/leagues/' +
                                req.body.collectionName +
                                '/images/' +
                                req.files.images[i].filename;
                            images.push(temp);
                        }
                        info.images = images;
                    }
                    return [4 /*yield*/, league_1.default.findById(req.params._id).lean()];
                case 1:
                    league = _a.sent();
                    shouldSchedule = true;
                    if (league && info.endTime) {
                        oldEndTime = new Date(league.endTime).getTime();
                        newEndTime = new Date(info.endTime).getTime();
                        if (oldEndTime === newEndTime ||
                            league.rewarded === true ||
                            league.endTime < Date.now()) {
                            shouldSchedule = false;
                        }
                    }
                    league_1.default.findOneAndUpdate({
                        _id: req.params.id
                    }, info, {
                        new: true
                    }, function (err, league) {
                        if (err) {
                            return res.status(400).send();
                        }
                        else if (!league) {
                            return res.sendStatus(404);
                        }
                        if (shouldSchedule) {
                            var job = {
                                fireTime: new Date(league.endTime),
                                processOwner: process.env.NODE_APP_INSTANCE != null
                                    ? process.env.NODE_APP_INSTANCE
                                    : null
                            };
                            job_1.default.findOneAndUpdate({
                                property: league.collectionName,
                                type: 'reward'
                            }, job, function (err, dbJob) {
                                if (err) {
                                    debug(err);
                                }
                                if (dbJob && !err) {
                                    if (!dbJob.processOwner ||
                                        dbJob.processOwner.toString() === process.env.NODE_APP_INSTANCE) {
                                        node_schedule_1.default.rescheduleJob(league.collectionName, league.endTime);
                                    }
                                    else {
                                        jobController_1.createJobHelper(dbJob, currencyController_1.giveRewardsHelper, false)
                                            .then(function () { return res.status(200).send(league); })
                                            .catch(function (err) {
                                            debug(err);
                                            return res.sendStatus(500);
                                        });
                                    }
                                }
                            });
                        }
                        return res.status(200).send(league);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateLeague = updateLeague;
function deleteLeague(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            league_1.default.findOneAndRemove({
                _id: req.params.id
            })
                .lean()
                .exec(function (err, league) {
                if (err) {
                    debug(err);
                    return res.status(500).send(err);
                }
                else if (league) {
                    mongoose_1.default.connection.collections[league.collectionName].drop(function (err) {
                        if (!err) {
                            delete mongoose_1.default.connection.models[league.collectionName];
                        }
                    });
                    rimraf_1.default.sync(path_1.default.join(__dirname, '../../public/leagues', league.collectionName));
                    jobController_1.deleteJobHelper(league.collectionName, 'reward').catch(function () { });
                    return res.status(200).send({
                        data: league
                    });
                }
                else {
                    return res.sendStatus(404);
                }
            });
            return [2 /*return*/];
        });
    });
}
exports.deleteLeague = deleteLeague;
//# sourceMappingURL=leagueController.js.map