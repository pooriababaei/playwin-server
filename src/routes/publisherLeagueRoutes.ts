import Debug from 'debug';
import express from 'express';
import * as leagueController from '../controllers/publisherLeagueController';
import { leagueUpload } from '../utils/fileUpload';
import { isPublisher, isPublisherOrAdmin } from '../utils/middlewares';
const debug = Debug('Publisher League Route:');
const router = express.Router();

router.route('/').get(leagueController.getLeagues).post(isPublisher, leagueController.createLeague);
router
  .route('/:id')
  .get(leagueController.getLeague)
  .put(isPublisherOrAdmin, leagueUpload, leagueController.updateLeague)
  .delete(isPublisherOrAdmin, leagueController.deleteLeague);

export default router;
