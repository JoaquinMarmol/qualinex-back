import express from 'express';
import {
  createWarranty,
  getUserWarranties,
  getWarrantyById,
  updateWarranty,
  deleteWarranty,
  getUserWarrantyStats,
  getAllWarranties,
  searchWarranties,
  updateWarrantyStatus, // 👈 nuevo controlador
} from '../controllers/warrantyController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateWarrantyCreate,
  validateWarrantyUpdate,
  validateAdminWarrantyUpdate, // 👈 nueva validación
} from '../utils/validators.js';

const router = express.Router();

// 🔓 Pública
router.get('/search', searchWarranties);

// 🔒 Autenticadas
router.use(authenticateToken);

router.get('/all', getAllWarranties);
router.post('/', validateWarrantyCreate, createWarranty);
router.get('/', getUserWarranties);
router.get('/stats', getUserWarrantyStats);
router.get('/:id', getWarrantyById);
router.put('/:id', validateWarrantyUpdate, updateWarranty);
router.delete('/:id', deleteWarranty);

// 👇 NUEVA RUTA ADMIN
router.put('/admin/:id/status', validateAdminWarrantyUpdate, updateWarrantyStatus);

export default router;
