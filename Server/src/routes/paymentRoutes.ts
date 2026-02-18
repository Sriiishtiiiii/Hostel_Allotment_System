import { Router } from 'express';
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Logged-in users can view their payments
router.get('/', requireAuth, getPayments);
router.get('/:id', requireAuth, getPayment);

// Only admin should create/update/delete payment records
router.post('/', requireAuth, requireAdmin, createPayment);
router.put('/:id', requireAuth, requireAdmin, updatePayment);
router.delete('/:id', requireAuth, requireAdmin, deletePayment);

export default router;
