import Debug from 'debug';
import express from 'express';
import * as boxController from '../controllers/boxController';
import * as boxPurchaseController from '../controllers/boxPurchaseController';
import { boxUpload } from '../utils/fileUpload';
import { isAdmin, isUser, isUserOrAdmin } from '../utils/middlewares';
const router = express.Router();
const debug = Debug('Box Route:');

router.get('/boxPurchase/:boxId', boxPurchaseController.purchaseBox);
router.get('/validatePurchase', boxPurchaseController.validatePurchase);

router.get(
  '/totalPurchasesTillNow',
  isAdmin,
  boxPurchaseController.totalPurchases
);

router
  .route('/')
  .get(isUserOrAdmin, boxController.getBoxes)
  .post(isAdmin, boxController.createBox);
router
  .route('/:id')
  .get(isUserOrAdmin, boxController.getBox)
  .put(isAdmin, boxController.updateBox)
  .delete(isAdmin, boxController.deleteBox);

export default router;
