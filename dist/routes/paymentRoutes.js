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
var paymentController = __importStar(require("../controllers/paymentController"));
var middlewares_1 = require("../utils/middlewares");
var router = express_1.default.Router();
var debug = debug_1.default('Payment Route:');
router.get('/', middlewares_1.isAdmin, paymentController.getToPays);
router.put('/:id', middlewares_1.isAdmin, paymentController.updatePayment);
router.get('/notPaidsNumber', middlewares_1.isAdmin, paymentController.notPaidsNumber);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map