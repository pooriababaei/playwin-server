import Debug from 'debug';
import express from 'express';
import * as leagueController from '../controllers/publisherLeagueController';
import { leagueUpload } from '../utils/fileUpload';
import { isAdmin, isUserOrAdmin } from '../utils/middlewares';
const debug = Debug('Publisher League Route:');
const router = express.Router();

router
  .route('/')
  .get(isUserOrAdmin, leagueController.getLeagues)
  .post(isPublisher, leagueController.createLeague);
router
  .route('/:id')
  .get(isUserOrAdmin, leagueController.getLeague)
  .put(isAdmin, leagueUpload, leagueController.updateLeague)
  .delete(isAdmin, leagueController.deleteLeague);

export default router;
