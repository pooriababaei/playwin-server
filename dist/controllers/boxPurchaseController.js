"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var zarinpal_checkout_1 = __importDefault(require("zarinpal-checkout"));
var globals_1 = require("../utils/globals");
//const merchantId = fs.readFileSync(path.join(__dirname, '../keys/merchant_key')).toString();
var box_1 = __importDefault(require("../db/models/box"));
var user_1 = __importDefault(require("../db/models/user"));
var boxPurchase_1 = __importDefault(require("../db/models/boxPurchase"));
var zarinpal = zarinpal_checkout_1.default.create(process.env.MERCHANT_ID, false);
var debug = debug_1.default("BoxPurchase Controller:");
///////// helper functions
function saveBoxTransaction(userId, transactionId, boxId) {
    var p = {
        user: userId,
        transactionId: transactionId,
        box: boxId
    };
    var transaction = new boxPurchase_1.default(p);
    return new Promise(function (resolve, reject) {
        transaction.save(function (err, transaction) {
            if (err) {
                reject(err);
            }
            else if (transaction) {
                resolve(transaction);
            }
        });
    });
} // used inside of buyBox
function buyBox(userId, transactionId, boxId) {
    return __awaiter(this, void 0, void 0, function () {
        var box, _a, user, bt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, box_1.default.findById(boxId)];
                case 1:
                    box = _b.sent();
                    _a = Promise.all([
                        user_1.default.findOneAndUpdate({ _id: userId }, { $inc: { coupon: box.coupon } }, { new: true }),
                        saveBoxTransaction(userId, transactionId, boxId)
                    ]), user = _a[0], bt = _a[1];
                    return [2 /*return*/, { user: user, transaction: bt }];
            }
        });
    });
} // not sure how the usage will be. from client or an payment api.
///////// end of helper function
function purchaseBox(req, res) {
    box_1.default.findById(req.params.boxId, function (err, box) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!box) {
            return res.sendStatus(400);
        }
        else {
            var price = box.offPrice ? box.offPrice : box.price;
            zarinpal
                .PaymentRequest({
                Amount: price,
                CallbackURL: globals_1.PLAYWIN_API_URL + "/user/validatePurchase",
                Description: "خرید کوپن فرصت",
                Mobile: req.phoneNumber
            })
                .then(function (response) {
                if (response.status === 100) {
                    return res.status(200).send({
                        goTo: "https://www.zarinpal.com/pg/StartPay/" + response.url + "/MobileGate"
                    });
                }
                else {
                    return res.sendStatus(500);
                }
            })
                .catch(function () {
                return res.sendStatus(500);
            });
        }
    });
}
exports.purchaseBox = purchaseBox;
function validatePurchase(req, res) {
    var authority = req.query.authority;
    var status = req.query.status;
    if (status === "OK") {
        zarinpal
            .PaymentVerification({
            Amount: "1000",
            Authority: "000000000000000000000000000000000000"
        })
            .then(function (response) {
            if (response.status === -21) {
                console.log("Empty!");
            }
            else {
                console.log("Verified! Ref ID: " + response.RefID);
            }
        })
            .catch(function (err) {
            console.error(err);
        });
    }
} // must be completed !!!
exports.validatePurchase = validatePurchase;
function totalPurchases(req, res) {
    boxPurchase_1.default.aggregate([
        {
            $group: {
                _id: null,
                sum: {
                    $sum: "$amount"
                }
            }
        }
    ], function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!result || result.length === 0) {
            return res.status(200).send({ sum: 0 });
        }
        return res.status(200).send({ sum: result[0].sum });
    });
} // mush add $match to get just paid purchases
exports.totalPurchases = totalPurchases;
//# sourceMappingURL=boxPurchaseController.js.map