import express from 'express';
import {
  createWarranty,
  getUserWarranties,
  getWarrantyById,
  updateWarranty,
  deleteWarranty,
  getUserWarrantyStats
} from '../controllers/warrantyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateWarrantyCreate, validateWarrantyUpdate } from '../utils/validators.js';

const router = express.Router();

// All warranty routes require authentication
router.use(authenticateToken);

// User warranty routes
router.post('/', validateWarrantyCreate, createWarranty);
router.get('/', getUserWarranties);
router.get('/stats', getUserWarrantyStats);
router.get('/:id', getWarrantyById);
router.put('/:id', validateWarrantyUpdate, updateWarranty);
router.delete('/:id', deleteWarranty);

export default router;
