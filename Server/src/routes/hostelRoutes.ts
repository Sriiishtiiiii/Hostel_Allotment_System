import { Router } from 'express';
import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from '../controllers/hostelController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllHostels);
router.get('/:id', authenticate, getHostelById);
router.post('/', authenticate, authorize('admin'), createHostel);
router.put('/:id', authenticate, authorize('admin'), updateHostel);
router.delete('/:id', authenticate, authorize('admin'), deleteHostel);

export default router;
