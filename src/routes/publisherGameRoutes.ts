import express from 'express';
import * as gameController from '../controllers/publisherGameController';
import { publisherGameUpload } from '../utils/fileUpload';
import { isAdmin, isUserOrAdmin } from '../utils/middlewares';
const router = express.Router();

router
  .route('/')
  .get(gameController.getPublishersGames)
  .post(isAdmin, publisherGameUpload, gameController.createPublisherGame);
router
  .route('/:id')
  .get(gameController.getPublisherGame)
  .put(isAdmin, publisherGameUpload, gameController.updatePublisherGame)
  .delete(isAdmin, gameController.deletePublisherGame);

export default router;
