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
var mongoose_1 = __importDefault(require("mongoose"));
var underscore_1 = __importDefault(require("underscore"));
var debug = debug_1.default('Payment Controller:');
var ToPay = mongoose_1.default.model('toPay');
function getToPays(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var sort, filter, query, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sort = null;
                    filter = null;
                    if (req.query.sort) {
                        sort = JSON.parse(req.query.sort);
                    }
                    if (req.query.filter) {
                        filter = JSON.parse(req.query.filter);
                    }
                    query = ToPay.find();
                    if (filter) {
                        query.find(filter);
                    }
                    return [4 /*yield*/, ToPay.find().countDocuments()];
                case 1:
                    count = _a.sent();
                    if (sort) {
                        query.sort([sort]);
                    }
                    query.skip((req.query.page - 1) * req.query.perPage).limit(parseInt(req.query.perPage))
                        .populate({
                        path: 'user',
                        select: 'username phoneNumber account'
                    }).exec(function (err, toPays) {
                        if (err) {
                            return res.sendStatus(500);
                        }
                        if (!toPays) {
                            return res.sendStatus(404);
                        }
                        return res.set({
                            'Access-Control-Expose-Headers': 'x-total-count',
                            'x-total-count': count
                        }).status(200).json(toPays);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.getToPays = getToPays;
function updatePayment(req, res) {
    var payId = req.params.id;
    var info = underscore_1.default.pick(req.body, 'paid', 'payTime');
    ToPay.findOneAndUpdate({
        _id: payId
    }, info, {
        new: true
    }).populate({
        path: 'user',
        select: 'username phoneNumber account'
    }).exec(function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(result);
    });
}
exports.updatePayment = updatePayment;
function notPaidsNumber(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var num;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ToPay.find({
                        paid: false
                    }).countDocuments()];
                case 1:
                    num = _a.sent();
                    return [2 /*return*/, res.status(200).send({
                            count: num
                        })];
            }
        });
    });
}
exports.notPaidsNumber = notPaidsNumber;
//# sourceMappingURL=paymentController.js.map