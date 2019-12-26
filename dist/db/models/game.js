"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var gameSchema = new mongoose_1.Schema({
    name: { type: String, minLength: 3, required: true },
    description: { type: String },
    available: { type: Boolean, default: false },
    images: [{ type: String }],
    mainImage: { type: String, required: true },
    html: { type: String },
    gameZip: { type: String },
    color: { type: String }
}, { versionKey: false });
var gameModel = mongoose_1.model("game", gameSchema);
exports.default = gameModel;
//# sourceMappingURL=game.js.map