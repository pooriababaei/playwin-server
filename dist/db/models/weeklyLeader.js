"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var weeklyLeaderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", index: true },
    reward: { type: Number, default: 0, index: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }
});
var weekLyLeaderModel = mongoose_1.model("weeklyLeader", weeklyLeaderSchema);
exports.default = weekLyLeaderModel;
//# sourceMappingURL=weeklyLeader.js.map