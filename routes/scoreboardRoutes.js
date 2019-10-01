let express = require('express');
let router = express.Router();
const {isUser, isUserOrAdmin, isLeagueUp,isApp} = require('../utils/middlewares');
const scoreboardController = require('../controllers/scoreboardController');
const debug = require('debug')('Scorebaord Route:');

router.get('/:collectionName',isUserOrAdmin, scoreboardController.getRecords);
router.get('/modifyScoreboard/:collectionName/:type',isApp, isUser, isLeagueUp, scoreboardController.modifyScoreboard);
router.get('/userRecord/:collectionName',isUser,scoreboardController.userRecord);
router.get('/userRank/:collectionName', isUser, scoreboardController.userRank);
router.get('/surroundingUsers/:collectionName/:limit', isUser, scoreboardController.surroundingUsers);


module.exports=router;