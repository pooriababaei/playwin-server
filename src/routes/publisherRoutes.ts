import express from 'express';
const router = express.Router();
import * as publisherController from '../controllers/publisherController';
import { isSuperAdmin, isAdmin } from '../utils/middlewares';

router
  .route('/')
  .get(isAdmin, publisherController.getPublishers)
  .post(isAdmin, publisherController.createPublisher);

router
  .route('/:id')
  .get(isAdmin, publisherController.getPublisher)
  .put(isAdmin, publisherController.updatePublisher)
  .delete(isAdmin, publisherController.deletePublisher);

router.post('/auth/login', publisherController.login);

export default router;
