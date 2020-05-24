import express from 'express';
const router = express.Router();
import * as authController from '../controllers/adminAuthController';
import * as adminController from '../controllers/adminController';
import { isSuperAdmin } from '../utils/middlewares';

router
  .route('/')
  .get(isSuperAdmin, adminController.getAdmins)
  .post(isSuperAdmin, adminController.createAdmin);

router
  .route('/:id')
  .get(isSuperAdmin, adminController.getAdmin)
  .put(isSuperAdmin, adminController.updateAdmin)
  .delete(isSuperAdmin, adminController.deleteAdmin);

router.post('/auth/login', authController.login);
router.get('/auth/forgotPassword/:email', authController.forgotPassword);
router.get('/auth/checkToken/:token', authController.checkToken);
router.post('/auth/resetPassword/:token', authController.resetPassword);

export default router;
