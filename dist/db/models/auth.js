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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var mongoose_1 = require("mongoose");
var debug = debug_1.default("Auth Model:");
var authSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: true },
    authToken: { type: Number },
    createdAt: { type: Date, default: Date.now, expires: 90 } // 90 seconds
}, { collection: "auth", versionKey: false });
authSchema.statics.authenticate = function (phoneNumber, authToken) {
    var Auth = this;
    var user = {
        phoneNumber: phoneNumber,
        authToken: authToken
    };
    return Auth.findOne(__assign({}, user), function (err, res) {
        if (err) {
            debug("err");
        }
        if (res) {
            return Promise.resolve(res);
        }
        else if (!res) {
            return Promise.resolve();
        }
    });
};
authSchema.pre("save", function (next) {
    this.authToken = Math.floor(Math.random() * (99999 - 10000) + 10000);
    return next();
});
var authModel = mongoose_1.model("auth", authSchema);
exports.default = authModel;
//# sourceMappingURL=auth.js.map