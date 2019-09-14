let express = require('express');
let router = express.Router();
const {isUser, isUserOrAdmin, isLeagueUp} = require('../utils/middlewares');
const scoreboardController = require('../controllers/scoreboardController');
const debug = require('debug')('Scorebaord Route:');


router.get('/modifyScoreboard/:collectionName/:type', isUser, isLeagueUp, scoreboardController.modifyScoreboard);
router.get('/userRecord/:collectionName',isUser,scoreboardController.userRecord);
router.get('/userRank/:collectionName', isUser, scoreboardController.userRank);
router.get('/surroundingUsers/:collectionName/:limit', isUser, scoreboardController.surroundingUsers);
router.get('/:collectionName',isUserOrAdmin, scoreboardController.pagingUsers);


module.exports=router;