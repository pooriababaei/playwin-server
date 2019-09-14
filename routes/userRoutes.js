let express = require('express');
const path = require('path');
const resize= require('../utils/resize');
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
router
    .route('/:id', isUser,userController.getUser)
    .get(userController.getUser)
    .put(userController.updateUser);

module.exports = router;
