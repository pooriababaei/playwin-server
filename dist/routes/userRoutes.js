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
var debug_1 = __importDefault(require("debug"));
var userAuthController = __importStar(require("../controllers/userAuthController"));
var userController = __importStar(require("../controllers/userController"));
var middlewares_1 = require("../utils/middlewares");
var debug = debug_1.default('User Route:');
router.get('/checkNewVersion/:version', middlewares_1.isUser, userController.checkNewVersion);
router.get('/getAuthCode/:phoneNumber', middlewares_1.isApp, userAuthController.getAuthCode);
router.get('/auth/:phoneNumber/:token', middlewares_1.isApp, userAuthController.auth);
router.get('/checkUniqueUsername/:username', userAuthController.checkUniqueUsername);
router.post('/signup', userAuthController.signup);
router.get('/usersCount', middlewares_1.isAdmin, userController.usersCount);
router.get('/introduceInviter/:inviter', middlewares_1.isUser, userController.introduceInviter);
router.get('/', middlewares_1.isAdmin, userController.getUsers);
router.put('/', middlewares_1.isUser, userController.updateUser);
router
    .route('/:id')
    .get(middlewares_1.isUserOrAdmin, userController.getUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map