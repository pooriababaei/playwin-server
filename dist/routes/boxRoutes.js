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
var boxController = __importStar(require("../controllers/boxController"));
var boxPurchaseController = __importStar(require("../controllers/boxPurchaseController"));
var fileUpload_1 = require("../utils/fileUpload");
var middlewares_1 = require("../utils/middlewares");
var router = express_1.default.Router();
var debug = debug_1.default('Box Route:');
router.get('/boxPurchase/:boxId', boxPurchaseController.purchaseBox);
router.get('/validatePurchase', boxPurchaseController.validatePurchase);
router.get('/totalPurchasesTillNow', middlewares_1.isAdmin, boxPurchaseController.totalPurchases);
router
    .route('/')
    .get(middlewares_1.isUserOrAdmin, boxController.getBoxes)
    .post(middlewares_1.isAdmin, fileUpload_1.boxUpload, boxController.createBox);
router
    .route('/:id')
    .get(middlewares_1.isUserOrAdmin, boxController.getBox)
    .put(middlewares_1.isAdmin, fileUpload_1.boxUpload, boxController.updateBox)
    .delete(middlewares_1.isAdmin, boxController.deleteBox);
exports.default = router;
//# sourceMappingURL=boxRoutes.js.map