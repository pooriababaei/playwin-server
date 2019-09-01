let express = require('express');
let router = express.Router();
const {isAdmin, isUserOrAdmin,isUser} = require('../utils/middlewares');
const boxController = require('../controllers/boxController');
const boxPurchaseController = require('../controllers/boxPurchaseController');
const debug = require('debug')('Box Route:');


router
    .route('/')
    .get(isUserOrAdmin, boxController.getBoxes)
    .post(isAdmin, boxController.createBox);
router
    .route('/:id')
    .get(isUserOrAdmin, boxController.getBox)
    .put(isAdmin, boxController.updateBox)
    .delete(isAdmin, boxController.deleteBox);

router.get('/boxPurchase/:boxId', boxPurchaseController.purchaseBox);

router.get('/validatePurchase',boxPurchaseController.validatePurchase);

module.exports = router;