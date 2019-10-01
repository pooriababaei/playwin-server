let express = require('express');
let router = express.Router();
const {isUser,isUserOrAdmin, isAdmin,isApp} = require('../utils/middlewares');
const userAuthController = require('../controllers/userAuthController');
const userController = require('../controllers/userController');
const debug = require('debug')('User Route:');


router.get('/checkNewVersion/:version',isUser, userController.checkNewVersion);
router.get('/getAuthCode/:phone',isApp,userAuthController.getAuthCode);
router.get('/auth/:phone/:token',isApp, userAuthController.auth);
router.get('/checkUniqueUsername/:username',userAuthController.checkUniqueUsername);
router.post('/signup',isApp, userAuthController.signup);
router.get('/usersCount',isAdmin, userController.usersCount);

router.get('/',isAdmin,userController.getUsers);
router.put('/', isUser, userController.updateUser);
router
    .route('/:id')
    .get(isUserOrAdmin, userController.getUser);

module.exports = router;
