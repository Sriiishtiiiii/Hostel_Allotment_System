import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getComplaints,
  createComplaint,
  updateComplaint,
} from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', requireAuth, getComplaints);
router.post('/', requireAuth, createComplaint);
router.put('/:id', requireAuth, requireAdmin, updateComplaint);

export default router;
