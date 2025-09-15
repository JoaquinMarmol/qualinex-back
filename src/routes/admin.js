import express from 'express';
import {
  getAllWarranties,
  updateWarrantyStatus,
  assignWarranty,
  getAdminStats,
  getAdminUsers,
  getMyAssignedWarranties,
  bulkUpdateWarranties
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateAdminWarrantyUpdate } from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin warranty management
router.get('/warranties', getAllWarranties);
router.get('/warranties/assigned', getMyAssignedWarranties);
router.put('/warranties/:id', validateAdminWarrantyUpdate, updateWarrantyStatus);
router.put('/warranties/:id/assign', assignWarranty);
router.put('/warranties/bulk-update', bulkUpdateWarranties);

// Admin statistics and reporting
router.get('/stats', getAdminStats);
router.get('/users/admins', getAdminUsers);

export default router;

