import { Router } from 'express';
import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from '../controllers/hostelController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public route (for Apply page)
router.get('/', getAllHostels);

// Protected routes
router.get('/:id', requireAuth, getHostelById);
router.post('/', requireAuth, createHostel);
router.put('/:id', requireAuth, updateHostel);
router.delete('/:id', requireAuth, deleteHostel);

export default router;
