let express = require('express');
let router = express.Router();
const {isUser, isLeagueUp,isAdmin,isUserOrAdmin} = require('../utils/middlewares');
const currencyController = require('../controllers/currencyController');
const debug = require('debug')('Currency Route:');


router.get('/exchangecouponsToLeagueOppo/:collectionName/:opportunities/', isUser, isLeagueUp, currencyController.exchangecouponsToLeagueOppo);
router.get('/exchangecoinsToMoney/:coins',isUser, currencyController.exchangecoinsToMoney);
router.put('/rewardLeagueWinners/:collectionName', isAdmin, currencyController.giveRewards);
router.get('/achievements', isUserOrAdmin, currencyController.achievements);
router.get('/achieve/:id', isUser, currencyController.achieve);


module.exports=router;