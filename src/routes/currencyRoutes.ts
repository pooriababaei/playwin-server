import Debug from 'debug';
import express from 'express';
import * as currencyController from '../controllers/currencyController';
import {isAdmin, isLeagueUp,isUser,isUserOrAdmin} from '../utils/middlewares';
let router = express.Router();
const debug = Debug('Currency Route:');

router.get('/exchangecouponsToLeagueOppo/:collectionName/:opportunities/', isUser, isLeagueUp, currencyController.exchangecouponsToLeagueOppo);
router.get('/exchangecoinsToMoney/:coins',isUser, currencyController.exchangecoinsToMoney);
router.put('/rewardLeagueWinners/:collectionName', isAdmin, currencyController.giveRewards);
router.get('/achievements', isUserOrAdmin, currencyController.achievements);
router.get('/achieve/:id', isUser, currencyController.achieve);

export default router;