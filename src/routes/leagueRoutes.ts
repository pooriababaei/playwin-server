import Debug from 'debug';
import express from 'express';
import * as leagueController from '../controllers/leagueController';
import { leagueUpload } from '../utils/fileUpload';
import { isAdmin, isUserOrAdmin } from '../utils/middlewares';
import { createLeagueValidator } from '../validators/league';
const debug = Debug('League Route:');
let router = express.Router();

router
  .route('/')
  .get(isUserOrAdmin, leagueController.getLeagues)
  .post(
    isAdmin,
    leagueUpload,
    createLeagueValidator,
    leagueController.createLeague
  );
router
  .route('/:id')
  .get(isUserOrAdmin, leagueController.getLeague)
  .put(isAdmin, leagueUpload, leagueController.updateLeague)
  .delete(isAdmin, leagueController.deleteLeague);

export default router;
