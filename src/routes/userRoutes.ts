import express from 'express';
let router = express.Router();
import Debug from 'debug';
import * as userAuthController from '../controllers/userAuthController';
import * as userController from '../controllers/userController';
import { isAdmin, isApp, isUser, isUserOrAdmin } from '../utils/middlewares';
const debug = Debug('User Route:');

router.get('/checkNewVersion/:version', isUser, userController.checkNewVersion);
router.get('/getAuthCode/:phoneNumber', isApp, userAuthController.getAuthCode); // isApp
router.get('/auth/:phoneNumber/:token', isApp, userAuthController.auth); // isApp
router.get(
  '/checkUniqueUsername/:username',
  userAuthController.checkUniqueUsername
);
router.post('/signup', userAuthController.signup);
router.get('/usersCount', isAdmin, userController.usersCount);
router.get(
  '/introduceInviter/:inviter',
  isUser,
  userController.introduceInviter
);

router.get('/', isAdmin, userController.getUsers);
router.put('/', isUser, userController.updateUser);
router.get('/:id', isUserOrAdmin, userController.getUser);

export default router;
