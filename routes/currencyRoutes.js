let express = require('express');
let router = express.Router();
const {isUser, isLeagueUp,isAdmin} = require('../utils/middlewares');
const currencyController = require('../controllers/currencyController');
const debug = require('debug')('Currency Route:');


router.get('/exchangeTotalOppoToLeagueOppo/:leagueSpec/:opportunities/', isUser, isLeagueUp, currencyController.exchangeTotalOppoToLeagueOppo);
router.get('/exchangeCoinToMoney/:coins',isUser, currencyController.exchangeCoinToMoney);
router.get('/rewardLeagueWinners/:leagueSpec', isAdmin, currencyController.giveAwards);

module.exports=router;