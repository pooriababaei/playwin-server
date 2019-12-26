"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var underscore_1 = __importDefault(require("underscore"));
var boxPurchase_1 = __importDefault(require("../db/models/boxPurchase"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default("Box Controller:");
function getBox(req, res) {
    boxPurchase_1.default.findById(req.params.id, function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(result);
    });
}
exports.getBox = getBox;
function getBoxes(req, res) {
    boxPurchase_1.default.find(function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        return res
            .set({
            "Access-Control-Expose-Headers": "x-total-count",
            "x-total-count": result.length
        })
            .status(200)
            .send(result);
    });
}
exports.getBoxes = getBoxes;
function createBox(req, res) {
    var info = underscore_1.default.pick(req.body, "name", "type", "price", "offPrice", "coupon", "endTime");
    var box = new boxPurchase_1.default(info);
    box.save(function (err, box) {
        debug(err);
        if (err) {
            return res.sendStatus(500);
        }
        if (box) {
            return res.status(200).send(box);
        }
        return res.sendStatus(400);
    });
}
exports.createBox = createBox;
function updateBox(req, res) {
    var info = underscore_1.default.pick(req.body, "name", "type", "price", "offPrice", "coupon", "endTime");
    boxPurchase_1.default.findOneAndUpdate({ _id: req.params.id }, info, { new: true }, function (err, box) {
        if (err) {
            return res.sendStatus(500);
        }
        if (box) {
            return res.status(200).send(box);
        }
        return res.sendStatus(400);
    });
}
exports.updateBox = updateBox;
function deleteBox(req, res) {
    boxPurchase_1.default.findOneAndRemove({ _id: req.params.id }, function (err, box) {
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (box) {
            return res.sendStatus(200);
        }
        else {
            return res.sendStatus(404);
        }
    });
}
exports.deleteBox = deleteBox;
//# sourceMappingURL=boxController.js.map