let express = require('express');
let router = express.Router();
const {isUser, isUserOrAdmin, isLeagueUp} = require('../utils/middlewares');
const scoreboardController = require('../controllers/scoreboardController');
const debug = require('debug')('Scorebaord Route:');


router.get('/modifyScoreboard/:leagueSpec/:type', isUser, isLeagueUp, scoreboardController.modifyScoreboard);
router.get('/userRecord/:leagueSpec',isUser,scoreboardController.userRecord);
router.get('/userRank/:leagueSpec', isUser, scoreboardController.userRank);
router.get('/surroundingUserRanks/:leagueSpec/:limit', isUser, scoreboardController.surroundingUserRanks);
router.get('/surroundingUsers/:leagueSpec/:limit', isUser, scoreboardController.surroundingUsers);
router.get('/edgeUsersRank/:leagueSpec',isUser, scoreboardController.edgeUsersRank);
router.get('/:leagueSpec',isUserOrAdmin, scoreboardController.pagingUsers);


module.exports=router;