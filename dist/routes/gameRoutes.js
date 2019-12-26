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
var gameController = __importStar(require("../controllers/gameController"));
var fileUpload_1 = require("../utils/fileUpload");
var middlewares_1 = require("../utils/middlewares");
var router = express_1.default.Router();
var debug = debug_1.default('League Route:');
router
    .route('/')
    .get(middlewares_1.isUserOrAdmin, gameController.getGames)
    .post(middlewares_1.isAdmin, fileUpload_1.gameUpload, gameController.createGame);
router
    .route('/:id')
    .get(middlewares_1.isUserOrAdmin, gameController.getGame)
    .put(middlewares_1.isAdmin, fileUpload_1.gameUpload, gameController.updateGame)
    .delete(middlewares_1.isAdmin, gameController.deleteGame);
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map