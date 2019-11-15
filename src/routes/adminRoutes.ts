import express from 'express';
const router = express.Router();
import * as authController from '../controllers/adminAuthController';
import * as adminController from '../controllers/adminController';
import {isSuperAdmin} from '../utils/middlewares';

router
    .route('/')
    .get(isSuperAdmin,adminController.getAdmins)
    .post(isSuperAdmin,adminController.createAdmin);

router
    .route('/:id')
    .get(isSuperAdmin, adminController.getAdmin)
    .put(isSuperAdmin, adminController.updateAdmin)
    .delete(isSuperAdmin, adminController.deleteAdmin);

router.post('/login',authController.login);
router.get('/forgotPassword/:email',authController.forgotPassword);
router.get('/checkToken/:token',authController.checkToken);
router.post('/resetPassword/:token', authController.resetPassword);

export default router;