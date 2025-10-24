import express from 'express';
import {
  createWarranty,
  getUserWarranties,
  getWarrantyById,
  updateWarranty,
  deleteWarranty,
  getUserWarrantyStats,
  getAllWarranties,
  searchWarranties
} from '../controllers/warrantyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateWarrantyCreate, validateWarrantyUpdate } from '../utils/validators.js';

const router = express.Router();

// All warranty routes require authentication
router.use(authenticateToken);

// User warranty routes
router.get('/all', getAllWarranties);
router.post('/', validateWarrantyCreate, createWarranty);
router.get('/', getUserWarranties);
router.get('/search', searchWarranties);
router.get('/stats', getUserWarrantyStats);
router.get('/:id', getWarrantyById);
router.put('/:id', validateWarrantyUpdate, updateWarranty);
router.delete('/:id', deleteWarranty);

export default router;  
