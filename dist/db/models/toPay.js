"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var mongoose_2 = require("mongoose");
var mongoose_sequence_1 = __importDefault(require("mongoose-sequence"));
var autoIncrement = mongoose_sequence_1.default(mongoose_1.default);
var toPaySchema = new mongoose_2.Schema({
    user: { type: mongoose_2.Schema.Types.ObjectId, ref: "user" },
    amount: { type: Number, required: true, index: true },
    paid: { type: Boolean, default: false, index: true },
    payTime: { type: Date },
    paymentNumber: { type: Number }
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    },
    versionKey: false
});
toPaySchema.index({ createdAt: 1 });
toPaySchema.plugin(autoIncrement, { inc_field: "paymentNumber" });
var toPayModel = mongoose_2.model("toPay", toPaySchema);
exports.default = toPayModel;
//# sourceMappingURL=toPay.js.map