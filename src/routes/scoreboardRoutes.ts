import express from 'express';
import * as scoreboardController from '../controllers/scoreboardController';
import {isApp, isLeagueUp, isUser,isUserOrAdmin} from '../utils/middlewares';
let router = express.Router();
import Debug from 'debug';
const debug = Debug('Scorebaord Route:');

router.get('/weeklyLeaders',isUserOrAdmin,scoreboardController.weeklyLeaders);
router.get('/:collectionName',isUserOrAdmin, scoreboardController.getRecords);
router.get('/modifyScoreboard/:collectionName/:type',isUser, isApp, isLeagueUp, scoreboardController.modifyScoreboard);
router.get('/userRecord/:collectionName',isUser,scoreboardController.userRecord);
router.get('/userRank/:collectionName', isUser, scoreboardController.userRank);
router.get('/surroundingUsers/:collectionName/:limit', isUser, scoreboardController.surroundingUsers);

export default router;