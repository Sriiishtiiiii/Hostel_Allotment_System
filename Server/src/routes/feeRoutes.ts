import { Router } from 'express';
import {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
} from '../controllers/feeController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getAllFees);
router.get('/:id', requireAuth, getFeeById);
router.post('/', requireAuth, createFee);
router.put('/:id', requireAuth, updateFee);
router.delete('/:id', requireAuth, deleteFee);

export default router;
