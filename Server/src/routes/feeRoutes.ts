import { Router } from 'express';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
} from '../controllers/feeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllFees);
router.get('/:id', authenticate, getFeeById);
router.post('/', authenticate, authorize('admin'), createFee);
router.put('/:id', authenticate, authorize('admin'), updateFee);
router.delete('/:id', authenticate, authorize('admin'), deleteFee);

export default router;
