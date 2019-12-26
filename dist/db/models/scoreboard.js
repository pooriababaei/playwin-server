"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
function scoreboardModel(collectionName, opp) {
    if (opp !== null && collectionName !== null) {
        var scoreboardSchema = new mongoose_1.Schema({
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', index: true },
            score: { type: Number, default: 0, index: true },
            opportunity: { type: Number, default: opp },
            played: { type: Number, default: 1 },
            createdAt: { type: Date },
            updatedAt: { type: Date, index: true }
        }, { collection: collectionName, versionKey: false });
        scoreboardSchema.index({ score: -1, updatedAt: 1 });
        var scoreboardModel_1 = mongoose_1.model(collectionName, scoreboardSchema);
        return scoreboardModel_1;
    }
    else {
        var scoreboardModel_2 = mongoose_1.model(collectionName);
        return scoreboardModel_2;
    }
}
exports.scoreboardModel = scoreboardModel;
//# sourceMappingURL=scoreboard.js.map