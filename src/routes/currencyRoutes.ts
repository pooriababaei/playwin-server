import Debug from 'debug';
import express from 'express';
import * as currencyController from '../controllers/currencyController';
import {
  isAdmin,
  isLeagueUp,
  isUser,
  isUserOrAdmin
} from '../utils/middlewares';
const router = express.Router();
const debug = Debug('Currency Route:');

router.get(
  '/exchangeCouponToLeagueOppo/:collectionName/:opportunity/',
  isUser,
  isLeagueUp,
  currencyController.exchangecouponToLeagueOppo
);
router.get(
  '/exchangeRewardToMoney/:reward',
  isUser,
  currencyController.exchangeRewardToMoney
);
router.put(
  '/rewardLeagueWinners/:collectionName',
  isAdmin,
  currencyController.giveRewards
);
router.get('/achievements', isUserOrAdmin, currencyController.achievements);
router.get('/achieve/:id', isUser, currencyController.achieve);

export default router;
