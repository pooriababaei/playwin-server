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
var node_schedule_1 = __importDefault(require("node-schedule"));
var job_1 = __importDefault(require("../db/models/job"));
var debug = debug_1.default('Job Controller:');
///////// helper funcitons
function createJobHelper(job, task, saveInDb) {
    return __awaiter(this, void 0, void 0, function () {
        var newJob;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!saveInDb) return [3 /*break*/, 2];
                    newJob = new job_1.default(job);
                    return [4 /*yield*/, newJob.save()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    node_schedule_1.default.scheduleJob(job.property, job.fireTime, function (realFireTime) { return __awaiter(_this, void 0, void 0, function () {
                        var jobInFireTime;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, job_1.default.findOne({
                                        property: job.property,
                                        type: job.type
                                    })];
                                case 1:
                                    jobInFireTime = _a.sent();
                                    job_1.default.deleteOne({
                                        property: job.property,
                                        type: job.type
                                    }).exec();
                                    if (jobInFireTime &&
                                        Math.abs(new Date(jobInFireTime.fireTime).getTime() - realFireTime.getTime()) < 5000 &&
                                        (!jobInFireTime.processOwner ||
                                            jobInFireTime.processOwner.toString() == process.env.NODE_APP_INSTANCE)) {
                                        task(job.property)
                                            .then(function () {
                                            debug('task done');
                                        })
                                            .catch(function () {
                                            debug('error in doing task');
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/, 1];
            }
        });
    });
}
exports.createJobHelper = createJobHelper;
function deleteJobHelper(propery, type) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, job_1.default.deleteOne({ propery: propery, type: type })];
                case 1:
                    res = _a.sent();
                    node_schedule_1.default.cancelJob(propery);
                    return [2 /*return*/, res.deletedCount];
            }
        });
    });
}
exports.deleteJobHelper = deleteJobHelper;
///////// end of helper functions/
function getJobs(req, res) {
    job_1.default.find(function (err, jobs) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(jobs);
    });
}
exports.getJobs = getJobs;
function getJob(req, res) {
    job_1.default.findById(req.params.id, function (err, job) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(job);
    });
}
exports.getJob = getJob;
function createJob(req, res) { }
exports.createJob = createJob;
function updateJob(req, res) { }
exports.updateJob = updateJob;
function deleteJob(req, res) { }
exports.deleteJob = deleteJob;
//# sourceMappingURL=jobController.js.map