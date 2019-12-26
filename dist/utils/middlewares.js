"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_js_1 = __importDefault(require("crypto-js"));
var debug_1 = __importDefault(require("debug"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = __importDefault(require("mongoose"));
var league_1 = __importDefault(require("../db/models/league"));
//const user_key = fs.readFileSync(path.join(__dirname, '../keys/user_key')).toString();
//const admin_key = fs.readFileSync(path.join(__dirname, '../keys/admin_key')).toString();
//const app_key = fs.readFileSync(path.join(__dirname, '../keys/app_key')).toString();
var debug = debug_1.default("Middleware:");
exports.isUser = function (req, res, next) {
    if (req.headers.authorization == null) {
        return res.sendStatus(401);
    }
    var authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2) {
        return res.sendStatus(401);
    }
    var bearer = authArray[0];
    var token = authArray[1];
    if (bearer === "Bearer" && token) {
        jsonwebtoken_1.default.verify(token, process.env.USER_KEY, function (err, decoded) {
            if (err) {
                return res.sendStatus(401);
            }
            if (decoded && decoded.role && decoded.role === "user") {
                req.userId = decoded._id;
                req.username = decoded.username;
                req.phoneNumber = decoded.phoneNumber;
                next();
            }
            else {
                return res.sendStatus(401);
            }
        });
    }
    else {
        return res.sendStatus(401);
    }
};
exports.isAdmin = function (req, res, next) {
    if (req.headers.authorization == null) {
        return res.sendStatus(401);
    }
    var authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2) {
        return res.sendStatus(401);
    }
    var bearer = authArray[0];
    var token = authArray[1];
    if (bearer === "Bearer" && token) {
        jsonwebtoken_1.default.verify(token, process.env.ADMIN_KEY, function (err, decoded) {
            if (err) {
                return res.send(401).send();
            }
            if (decoded &&
                decoded.role &&
                (decoded.role === "admin" || decoded.role === "superadmin")) {
                req.adminId = decoded._id;
                req.email = decoded.email;
                req.username = decoded.username;
                next();
            }
            else {
                return res.status(401).send();
            }
        });
    }
    else {
        return res.status(401).send();
    }
};
exports.isSuperAdmin = function (req, res, next) {
    if (req.headers.authorization == null) {
        return res.sendStatus(401);
    }
    var authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2) {
        return res.sendStatus(401);
    }
    var bearer = authArray[0];
    var token = authArray[1];
    if (bearer === "Bearer" && token) {
        jsonwebtoken_1.default.verify(token, process.env.ADMIN_KEY, function (err, decoded) {
            if (err) {
                return res.send(401).send();
            }
            if (decoded && decoded.role && decoded.role === "superadmin") {
                req.adminId = decoded._id;
                req.email = decoded.email;
                req.username = decoded.username;
                next();
            }
            else {
                return res.status(401).send();
            }
        });
    }
    else {
        return res.status(401).send();
    }
};
exports.isUserOrAdmin = function (req, res, next) {
    if (req.headers.authorization == null) {
        return res.sendStatus(401);
    }
    var authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2) {
        return res.sendStatus(401);
    }
    var bearer = authArray[0];
    var token = authArray[1];
    if (bearer === "Bearer" && token) {
        jsonwebtoken_1.default.verify(token, process.env.USER_KEY, function (err, decoded) {
            if (decoded && decoded.role && decoded.role === "user") {
                req.userId = decoded._id;
                req.phoneNumber = decoded.phoneNumber;
                next();
            }
            else {
                jsonwebtoken_1.default.verify(token, process.env.ADMIN_KEY, function (err, decoded) {
                    if (decoded &&
                        decoded.role &&
                        (decoded.role === "admin" || decoded.role === "superadmin")) {
                        req.adminId = decoded._id;
                        req.email = decoded.email;
                        next();
                    }
                    else {
                        return res.sendStatus(401);
                    }
                });
            }
        });
    }
};
exports.isApp = function (req, res, next) {
    try {
        if (req.headers["content-size"] == null) {
            return res.sendStatus(401);
        }
        var phone = null;
        if (req.phoneNumber) {
            phone = req.phoneNumber;
        }
        else if (req.params.phoneNumber) {
            phone = req.params.phoneNumber;
        }
        else {
            return res.sendStatus(401);
        }
        var bytes_1 = crypto_js_1.default.AES.decrypt(req.headers["content-size"], process.env.APP_KEY + phone);
        if (bytes_1.toString() !== "") {
            var decryptedData = JSON.parse(bytes_1.toString(crypto_js_1.default.enc.Utf8));
            if (decryptedData.score) {
                req.score = decryptedData.score;
            }
            next();
        }
        else {
            return res.sendStatus(401);
        }
    }
    catch (err) {
        return res.sendStatus(401);
    }
};
exports.isLeagueUp = function (req, res, next) {
    var league;
    if (req.params.collectionName) {
        league = req.params.collectionName;
    }
    else if (req.body.collectionName) {
        league = req.body.collectionName;
    }
    else if (req.query.collectionName) {
        league = req.query.collectionName;
    }
    if (mongoose_1.default.modelNames().indexOf(league) > -1) {
        league_1.default.findOne({
            collectionName: league
        }, function (err, league) {
            if (err) {
                return res.sendStatus(500);
            }
            else if (!league) {
                return res.sendStatus(404);
            }
            else if (league &&
                (league.available === false ||
                    league.endTime.getTime() < Date.now() ||
                    league.startTime.getTime() > Date.now())) {
                // league is not up
                return res.sendStatus(404);
            }
            else {
                req.league = league;
                next();
            }
        });
    }
    else {
        return res.sendStatus(404);
    }
};
//# sourceMappingURL=middlewares.js.map