"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var boxSchema = new mongoose_1.Schema({
    type: { type: Number },
    price: { type: Number, required: true },
    offPrice: { type: Number },
    coupon: { type: Number },
    endTime: { type: Date }
}, { versionKey: false });
var boxModel = mongoose_1.model("box", boxSchema);
exports.default = boxModel;
//# sourceMappingURL=box.js.map