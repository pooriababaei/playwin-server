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
var express_1 = __importDefault(require("express"));
var scoreboardController = __importStar(require("../controllers/scoreboardController"));
var middlewares_1 = require("../utils/middlewares");
var router = express_1.default.Router();
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('Scorebaord Route:');
router.get('/weeklyLeaders', middlewares_1.isUserOrAdmin, scoreboardController.getWeeklyLeaders);
router.get('/topUsers', middlewares_1.isUserOrAdmin, scoreboardController.getTopUsers);
router.get('/:collectionName', middlewares_1.isUserOrAdmin, scoreboardController.getRecords);
router.get('/modifyScoreboard/:collectionName/:type', middlewares_1.isUser, middlewares_1.isApp, middlewares_1.isLeagueUp, scoreboardController.modifyScoreboard);
router.get('/userRecord/:collectionName', middlewares_1.isUser, scoreboardController.getUserRecord);
router.get('/userRank/:collectionName', middlewares_1.isUser, scoreboardController.getUserRank);
router.get('/surroundingUsers/:collectionName/:limit', middlewares_1.isUser, scoreboardController.getSurroundingUsers);
exports.default = router;
//# sourceMappingURL=scoreboardRoutes.js.map