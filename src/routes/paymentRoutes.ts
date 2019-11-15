import Debug from 'debug';
import express from 'express';
import * as paymentController from '../controllers/paymentController';
import {isAdmin} from '../utils/middlewares';
let router = express.Router();
const debug = Debug('Payment Route:');

router.get('/',isAdmin, paymentController.getToPays);
router.put('/:id',isAdmin, paymentController.updatePayment);
router.get('/notPaidsNumber', isAdmin, paymentController.notPaidsNumber);

export default router;