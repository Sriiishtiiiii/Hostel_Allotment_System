import { Router } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllRooms);

router.get('/:id', requireAuth, getRoomById);

router.post('/', requireAuth, requireAdmin, createRoom);
router.put('/:id', requireAuth, requireAdmin, updateRoom);
router.delete('/:id', requireAuth, requireAdmin, deleteRoom);

export default router;
