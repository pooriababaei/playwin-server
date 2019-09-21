let express = require('express');
const path = require('path');
let router = express.Router();
const {isUser,isUserOrAdmin, isAdmin} = require('../utils/middlewares');
const userAuthController = require('../controllers/userAuthController');
const userController = require('../controllers/userController');
const debug = require('debug')('User Route:');


router.get('/checkNewVersion/:version', userController.checkNewVersion);
router.get('/getAuthCode/:phone',userAuthController.getAuthCode);
router.get('/auth/:phone/:token', userAuthController.auth);
router.get('/checkUniqueUsername/:username',userAuthController.checkUniqueUsername);
router.post('/signup', userAuthController.signup);
router.get('/usersCount',isAdmin, userController.usersCount);

router.get('/',isAdmin,userController.getUsers);
router.put('/', isUser, userController.updateUser);
router
    .route(isUserOrAdmin,'/:id')
    .get(userController.getUser);

module.exports = router;
