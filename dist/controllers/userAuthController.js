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
var crypto_random_string_1 = __importDefault(require("crypto-random-string"));
var debug_1 = __importDefault(require("debug"));
var underscore_1 = __importDefault(require("underscore"));
var sms_1 = require("../utils/sms");
var globals_1 = require("../utils/globals");
var debug = debug_1.default("UserAuth Controller:");
var user_1 = __importDefault(require("../db/models/user"));
var auth_1 = __importDefault(require("../db/models/auth"));
function getAuthCode(req, res) {
    var info = {
        phoneNumber: req.params.phoneNumber
    };
    var auth = new auth_1.default(info);
    if ((info.phoneNumber.length === 10 || info.phoneNumber.length === 11) &&
        info.phoneNumber.match("0{0,1}9[0-9]{9}$")) {
        auth.save(function (err, auth) {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            if (auth) {
                sms_1.sendSMS(info.phoneNumber, auth.authToken); // here we should send authToken to auth phone number
                return res.status(200).json(auth); // this is for test . we shouldnt send auth info here
            }
        });
    }
    else {
        return res.sendStatus(400);
    }
}
exports.getAuthCode = getAuthCode;
function auth(req, res) {
    auth_1.default.authenticate(req.params.phoneNumber, req.params.token)
        .then(function (userAuth) {
        if (userAuth) {
            user_1.default.findOne({ phoneNumber: req.params.phoneNumber }, function (err, user) {
                if (err) {
                    return res.sendStatus(500);
                }
                if (user) {
                    // user exists.
                    var token = user.generateToken();
                    return res.status(200).json({ token: token, userId: user._id });
                }
                else if (!user) {
                    return res.status(200).send(userAuth);
                }
            });
        }
        else {
            res.sendStatus(400);
        }
    })
        .catch(function () {
        res.sendStatus(500);
    });
}
exports.auth = auth;
function checkUniqueUsername(req, res) {
    var username = req.params.username;
    user_1.default.findOne({ username: username }, function (err, user) {
        if (err) {
            return res.sendStatus(500);
        }
        else if (user) {
            return res.sendStatus(400);
        }
        else if (!user) {
            return res.sendStatus(200);
        }
    });
}
exports.checkUniqueUsername = checkUniqueUsername;
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var info, username, user, inviter, userInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    info = underscore_1.default.pick(req.body, "username", "phoneNumber", "avatar");
                    if (!!req.body.username) return [3 /*break*/, 4];
                    username = null;
                    user = null;
                    _a.label = 1;
                case 1:
                    username = crypto_random_string_1.default({ length: 7, type: "base64" });
                    return [4 /*yield*/, user_1.default.findOne({ username: username }).catch(function () { return res.sendStatus(500); })];
                case 2:
                    user = _a.sent();
                    info.username = username;
                    _a.label = 3;
                case 3:
                    if (user) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4:
                    if (!(req.body.invitedBy &&
                        req.body.invitedBy !== info.username &&
                        req.body.invitedBy.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, user_1.default.findOne({ username: req.body.invitedBy })
                            .lean()
                            .catch(function () { return res.sendStatus(500); })];
                case 5:
                    inviter = _a.sent();
                    if (inviter) {
                        info.coupon = globals_1.INVITE_REWARD;
                    }
                    _a.label = 6;
                case 6:
                    userInfo = new user_1.default(info);
                    userInfo.save(function (err, user) {
                        if (err) {
                            return res.status(400).send(err);
                        }
                        else if (user) {
                            if (info.coupon) {
                                user_1.default.findOneAndUpdate({ username: req.body.invitedBy }, {
                                    $inc: { coupon: globals_1.INVITE_REWARD },
                                    $push: { invitingUsers: user._id }
                                }, { new: true }, function (err, invitingUser) {
                                    if (err) {
                                        debug(err);
                                    }
                                });
                            }
                            return res
                                .status(200)
                                .json({ token: user.generateToken(), userId: user._id });
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.signup = signup;
//# sourceMappingURL=userAuthController.js.map