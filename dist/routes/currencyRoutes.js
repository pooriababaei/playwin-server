"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var express_1 = __importDefault(require("express"));
var currencyController = __importStar(require("../controllers/currencyController"));
var middlewares_1 = require("../utils/middlewares");
var router = express_1.default.Router();
var debug = debug_1.default("Currency Route:");
router.get("/exchangecouponToLeagueOppo/:collectionName/:opportunity/", middlewares_1.isUser, middlewares_1.isLeagueUp, currencyController.exchangecouponToLeagueOppo);
router.get("/exchangerewardToMoney/:reward", middlewares_1.isUser, currencyController.exchangerewardToMoney);
router.put("/rewardLeagueWinners/:collectionName", middlewares_1.isAdmin, currencyController.giveRewards);
router.get("/achievements", middlewares_1.isUserOrAdmin, currencyController.achievements);
router.get("/achieve/:id", middlewares_1.isUser, currencyController.achieve);
exports.default = router;
//# sourceMappingURL=currencyRoutes.js.map