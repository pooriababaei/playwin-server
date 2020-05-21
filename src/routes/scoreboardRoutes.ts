import express from 'express';
import * as scoreboardController from '../controllers/scoreboardController';
import { isApp, isLeagueUp, isUser, isUserOrAdmin } from '../utils/middlewares';
const router = express.Router();
import Debug from 'debug';
const debug = Debug('Scorebaord Route:');

router.get('/weeklyRewards', isUserOrAdmin, scoreboardController.getWeeklyRewards);
router.get('/topUsers', isUserOrAdmin, scoreboardController.getTopUsers);
router.get('/:collectionName', isUserOrAdmin, scoreboardController.getRecords);
router.get(
  '/modifyScoreboard/:collectionName/:type',
  isUser,
  isApp,
  isLeagueUp,
  scoreboardController.modifyScoreboard
); // isApp
router.get('/userRecord/:collectionName', isUser, scoreboardController.getUserRecord);
router.get('/userRank/:collectionName', isUser, scoreboardController.getUserRank);
router.get(
  '/surroundingUsers/:collectionName/:limit',
  isUser,
  scoreboardController.getSurroundingUsers
);

export default router;
