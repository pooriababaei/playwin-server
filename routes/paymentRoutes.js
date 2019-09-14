let express = require('express');
let router = express.Router();
const {isAdmin} = require('../utils/middlewares');
const paymentController = require('../controllers/paymentController');
const debug = require('debug')('Payment Route:');

router.get('/',isAdmin, paymentController.getToPays);
router.put('/:id',isAdmin, paymentController.updatePayment);

module.exports=router;