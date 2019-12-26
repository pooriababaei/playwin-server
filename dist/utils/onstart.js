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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var node_schedule_1 = __importDefault(require("node-schedule"));
var currencyController_1 = require("../controllers/currencyController");
var job_1 = __importDefault(require("../db/models/job"));
var league_1 = __importDefault(require("../db/models/league"));
var achievement_1 = __importDefault(require("../db/models/achievement"));
var debug = debug_1.default('onStart:');
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
                createDirectories();
            }
            achievement_1.default.createAchievements();
            initiateGiveRewardCronForAllLeagues();
            return [2 /*return*/];
        });
    });
}
exports.run = run;
function initiateGiveRewardCronForAllLeagues() {
    return __awaiter(this, void 0, void 0, function () {
        var leagues, _loop_1, _i, leagues_1, league;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, league_1.default.find().lean()];
                case 1:
                    leagues = _a.sent();
                    return [4 /*yield*/, job_1.default.deleteMany({}).exec()];
                case 2:
                    _a.sent();
                    _loop_1 = function (league) {
                        if (league.rewarded === false &&
                            new Date(league.endTime).getTime() > Date.now()) {
                            var job = new job_1.default({
                                type: 'reward',
                                property: league.collectionName,
                                fireTime: league.endTime,
                                processOwner: process.env.NODE_APP_INSTANCE != null
                                    ? process.env.NODE_APP_INSTANCE
                                    : null
                            });
                            job.save(function (err, job) {
                                if (!err) {
                                    node_schedule_1.default.scheduleJob(league.collectionName, league.endTime, function (fireTime) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            var jobInFireTime;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, job_1.default.findOne({
                                                            property: this.name,
                                                            type: 'reward'
                                                        })];
                                                    case 1:
                                                        jobInFireTime = _a.sent();
                                                        if (jobInFireTime &&
                                                            Math.abs(new Date(jobInFireTime.fireTime).getTime() -
                                                                fireTime.getTime()) < 1000 &&
                                                            (!jobInFireTime.processOwner ||
                                                                jobInFireTime.processOwner.toString() ===
                                                                    process.env.NODE_APP_INSTANCE)) {
                                                            currencyController_1.giveRewardsHelper(league.collectionName)
                                                                .then(function () {
                                                                debug('rewarded');
                                                                job_1.default.deleteOne({
                                                                    property: league.collectionName,
                                                                    type: 'reward'
                                                                }).exec();
                                                            })
                                                                .catch(function () {
                                                                debug('error in rewarding');
                                                            });
                                                        }
                                                        return [2 /*return*/];
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    };
                    for (_i = 0, leagues_1 = leagues; _i < leagues_1.length; _i++) {
                        league = leagues_1[_i];
                        _loop_1(league);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function createDirectories() {
    var dir = path_1.default.join(__dirname, '../../public/');
    var dir1 = path_1.default.join(__dirname, '../../public/leagues');
    var dir2 = path_1.default.join(__dirname, '../../public/games');
    var dir3 = path_1.default.join(__dirname, '../../public/boxes');
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    if (!fs_1.default.existsSync(dir1)) {
        fs_1.default.mkdirSync(dir1);
    }
    if (!fs_1.default.existsSync(dir2)) {
        fs_1.default.mkdirSync(dir2);
    }
    if (!fs_1.default.existsSync(dir3)) {
        fs_1.default.mkdirSync(dir3);
    }
}
//# sourceMappingURL=onstart.js.map