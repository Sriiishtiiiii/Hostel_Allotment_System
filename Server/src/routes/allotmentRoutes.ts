import { Router } from 'express';
import {
  getAllAllotments,
  getAllotmentById,
  createAllotment,
  updateAllotment,
  deleteAllotment,
} from '../controllers/allotmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllAllotments);
router.get('/:id', authenticate, getAllotmentById);
router.post('/', authenticate, authorize('admin'), createAllotment);
router.put('/:id', authenticate, authorize('admin'), updateAllotment);
router.delete('/:id', authenticate, authorize('admin'), deleteAllotment);

export default router;
