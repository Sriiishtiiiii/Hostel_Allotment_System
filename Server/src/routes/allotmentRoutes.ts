import { Router } from 'express';
import {
  getAllAllotments,
  getAllotmentById,
  createAllotment,
  updateAllotment,
  deleteAllotment,
} from '../controllers/allotmentController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Logged-in users can view
router.get('/', requireAuth, getAllAllotments);
router.get('/:id', requireAuth, getAllotmentById);

// Only admin can modify
router.post('/', requireAuth, requireAdmin, createAllotment);
router.put('/:id', requireAuth, requireAdmin, updateAllotment);
router.delete('/:id', requireAuth, requireAdmin, deleteAllotment);

export default router;
