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
var router = express_1.default.Router();
var authController = __importStar(require("../controllers/adminAuthController"));
var adminController = __importStar(require("../controllers/adminController"));
var middlewares_1 = require("../utils/middlewares");
router
    .route('/')
    .get(middlewares_1.isSuperAdmin, adminController.getAdmins)
    .post(middlewares_1.isSuperAdmin, adminController.createAdmin);
router
    .route('/:id')
    .get(middlewares_1.isSuperAdmin, adminController.getAdmin)
    .put(middlewares_1.isSuperAdmin, adminController.updateAdmin)
    .delete(middlewares_1.isSuperAdmin, adminController.deleteAdmin);
router.post('/login', authController.login);
router.get('/forgotPassword/:email', authController.forgotPassword);
router.get('/checkToken/:token', authController.checkToken);
router.post('/resetPassword/:token', authController.resetPassword);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map