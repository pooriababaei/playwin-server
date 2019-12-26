"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var leagueSchema = new mongoose_1.Schema({
    name: { type: String, minLength: 3, required: true },
    collectionName: { type: String, unique: true },
    description: { type: String },
    kind: { type: Number, required: true },
    leadersNumber: { type: Number, default: 0, required: true },
    reward: { type: Number, default: 0, required: true },
    loyaltyGiven: { type: Number, default: 0 },
    loyaltyReward: { type: Number, default: 0 },
    rewarded: { type: Boolean, default: false },
    defaultOpportunity: { type: Number, required: true },
    maxOpportunity: { type: Number },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    game: { type: String },
    available: { type: Boolean, default: false },
    gameHidden: { type: Boolean, default: false },
    images: [{ type: String }],
    mainImage: { type: String, required: true },
    html: { type: String, default: "/index.html" },
    gameZip: { type: String },
    color: { type: String }
}, { versionKey: false });
var leagueModel = mongoose_1.model("league", leagueSchema);
exports.default = leagueModel;
//# sourceMappingURL=league.js.map