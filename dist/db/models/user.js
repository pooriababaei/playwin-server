"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: toLower,
        index: true
    },
    invitingUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "user" }],
    reward: { type: Number, default: 0, index: true },
    totalReward: { type: Number, default: 0, index: true },
    coupon: { type: Number, default: 100 },
    achievements: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "achievement" }],
    participatedLeagues: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "league" }],
    phoneNumber: { type: String, required: true, unique: true, index: true },
    account: { type: String },
    loyalty: { type: Number, default: 0, index: true },
    avatar: { type: String, default: "0" },
    appSource: { type: String } // each number for an app source like :bazaar , playStore,directP
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    },
    versionKey: false
});
userSchema.index({ createdAt: 1 });
function toLower(v) {
    return v.toLowerCase();
}
userSchema.methods.generateToken = function () {
    var user = this;
    return jsonwebtoken_1.default
        .sign({
        _id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: "user"
    }, process.env.USER_KEY)
        .toString();
};
userSchema.statics.findByUsername = function (username, password) {
    var User = this;
    return User.findOne({ username: username }).then(function (user) {
        if (!user) {
            return Promise.reject();
        }
        return new Promise(function (resolve, reject) {
            // Use bcrypt.compare to compare password and user.password
            bcryptjs_1.default.compare(password, user.password, function (err, res) {
                if (res) {
                    resolve(user);
                }
                else {
                    reject(err);
                }
            });
        });
    });
};
var userModel = mongoose_1.model("user", userSchema);
exports.default = userModel;
//# sourceMappingURL=user.js.map