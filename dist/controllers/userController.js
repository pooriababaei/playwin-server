"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var underscore_1 = __importDefault(require("underscore"));
var globals_1 = require("../utils/globals");
var user_1 = __importDefault(require("../db/models/user"));
var debug = debug_1.default("User Controller:");
function checkNewVersion(req, res) {
    if (req.params.version < globals_1.NEWEST_APP_VERSION) {
        // there is a new version
        return res.status(200).json({
            code: 1,
            path: ""
        });
    }
    return res.status(200).json({
        code: 0
    });
}
exports.checkNewVersion = checkNewVersion;
function getUser(req, res) {
    if (req.userId && req.userId !== req.params.id) {
        return res.sendStatus(400);
    }
    user_1.default.findById(req.params.id, function (err, user) {
        if (err) {
            res.sendStatus(500);
        }
        else if (user == null) {
            res.sendStatus(404);
        }
        else {
            res.status(200).json(user);
        }
    });
}
exports.getUser = getUser;
function getUsers(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var sort, filter, query, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sort = null;
                    filter = null;
                    if (req.query.sort) {
                        sort = JSON.parse(req.query.sort);
                    }
                    if (req.query.filter) {
                        filter = JSON.parse(req.query.filter);
                    }
                    query = user_1.default.find();
                    if (filter && filter.username) {
                        query.find({
                            username: {
                                $regex: ".*" + filter.username + ".*"
                            }
                        });
                    }
                    if (filter && filter.phoneNumber) {
                        query.find({
                            phoneNumber: {
                                $regex: ".*" + filter.phoneNumber + ".*"
                            }
                        });
                    }
                    return [4 /*yield*/, user_1.default.find().countDocuments()];
                case 1:
                    count = _a.sent();
                    if (sort) {
                        query.sort([sort]);
                    }
                    query
                        .skip((req.query.page - 1) * req.query.perPage)
                        .limit(parseInt(req.query.perPage))
                        .exec(function (err, users) {
                        if (err) {
                            return res.sendStatus(500);
                        }
                        if (!users) {
                            return res.sendStatus(404);
                        }
                        return res
                            .set({
                            "Access-Control-Expose-Headers": "x-total-count",
                            "x-total-count": count
                        })
                            .status(200)
                            .json(users);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.getUsers = getUsers;
function updateUser(req, res) {
    // need to be checked
    var extraCoupon = req.query.extraCoupon;
    var info = underscore_1.default.pick(req.body, "avatar", "account");
    user_1.default.findOneAndUpdate({
        _id: req.userId
    }, __assign(__assign({}, info), { $inc: {
            coupon: extraCoupon === "true" ? globals_1.ADVERTISE_REWARD_COUPON : 0
        } }), {
        new: true
    }, function (err, user) {
        if (err) {
            res.sendStatus(500);
        }
        else if (!user) {
            res.sendStatus(404);
        }
        else {
            return res.status(200).send(user);
        }
    });
}
exports.updateUser = updateUser;
function usersCount(req, res) {
    user_1.default.find()
        .countDocuments()
        .then(function (c) {
        return res.status(200).send({
            count: c
        });
    })
        .catch(function (e) {
        debug(e);
        res.sendStatus(500);
    });
}
exports.usersCount = usersCount;
function introduceInviter(req, res) {
    var inviterUsername = req.params.inviter;
    if (inviterUsername && typeof inviterUsername === "string") {
        if (req.username === inviterUsername) {
            return res.sendStatus(400);
        }
        user_1.default.findOneAndUpdate({
            username: inviterUsername
        }, {
            $push: {
                invitingUsers: req.userId
            }
        })
            .then(function (user) {
            if (user) {
                return res.sendStatus(200);
            }
            return res.sendStatus(404);
        })
            .catch(function () {
            return res.sendStatus(500);
        });
    }
    else {
        return res.sendStatus(400);
    }
}
exports.introduceInviter = introduceInviter;
//# sourceMappingURL=userController.js.map