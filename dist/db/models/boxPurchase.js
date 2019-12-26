"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var boxPurchaseSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", index: true },
    authority: { type: String },
    amount: { type: Number, required: true },
    refId: { type: String }
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    },
    versionKey: false
});
var boxPurchaseModel = mongoose_1.model("boxPurchase", boxPurchaseSchema);
exports.default = boxPurchaseModel;
//# sourceMappingURL=boxPurchase.js.map