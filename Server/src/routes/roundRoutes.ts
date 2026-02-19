import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  listRounds,
  createRound,
  activateRound,
  getRoundStudents,
  getMyRoundStatus,
} from '../controllers/roundController.js';

const router = Router();

// Student route — must be before /:id to avoid Express treating "my-status" as an id
router.get('/my-status', requireAuth, getMyRoundStatus);

// Admin routes
router.get('/', requireAuth, requireAdmin, listRounds);
router.post('/', requireAuth, requireAdmin, createRound);
router.post('/:id/activate', requireAuth, requireAdmin, activateRound);
router.get('/:id/students', requireAuth, requireAdmin, getRoundStudents);

export default router;
