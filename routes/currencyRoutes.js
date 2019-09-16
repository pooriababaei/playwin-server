let express = require('express');
let router = express.Router();
const {isUser, isLeagueUp,isAdmin} = require('../utils/middlewares');
const currencyController = require('../controllers/currencyController');
const debug = require('debug')('Currency Route:');


router.get('/exchangecouponsToLeagueOppo/:collectionName/:opportunities/', isUser, isLeagueUp, currencyController.exchangecouponsToLeagueOppo);
router.get('/exchangecoinsToMoney/:coins',isUser, currencyController.exchangecoinsToMoney);
router.put('/rewardLeagueWinners/:collectionName', isAdmin, currencyController.giveRewards);


module.exports=router;