const express = require('express');
const router = express.Router();
const {isAdmin,isSuperAdmin}= require('../utils/middlewares');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/adminAuthController');

router
    .route('/',isSuperAdmin)
    .get(adminController.getAdmins)
    .post(adminController.createAdmin);

router
    .route('/:id', isSuperAdmin)
    .get(adminController.getAdmin)
    .put(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);

router.post('/login',authController.login);
router.get('/forgotPassword/:email',authController.forgotPassword);
router.get('/checkToken/:token',authController.checkToken);
router.post('/resetPassword/:token', authController.resetPassword);

module.exports = router;
