let express = require('express');
let router = express.Router();
const {isAdmin, isUserOrAdmin,isUser} = require('../utils/middlewares');
const {boxUpload} = require('../utils/fileUpload');
const boxController = require('../controllers/boxController');
const boxPurchaseController = require('../controllers/boxPurchaseController');
const debug = require('debug')('Box Route:');


router.get('/boxPurchase/:boxId', boxPurchaseController.purchaseBox);
router.get('/validatePurchase',boxPurchaseController.validatePurchase);

router.get('/totalPurchasesTillNow',isAdmin, boxPurchaseController.totalPurchases)

router
    .route('/')
    .get(isUserOrAdmin, boxController.getBoxes)
    .post(isAdmin,boxUpload, boxController.createBox);
router
    .route('/:id')
    .get(isUserOrAdmin, boxController.getBox)
    .put(isAdmin,boxUpload, boxController.updateBox)
    .delete(isAdmin, boxController.deleteBox);

module.exports = router;