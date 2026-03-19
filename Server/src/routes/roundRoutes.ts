import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  listRounds,
  createRound,
  activateRound,
  processRound,
  processAndAdvance,
  getRoundStudents,
  getRoundResults,
  getMyRoundStatus,
} from '../controllers/roundController.js';

const router = Router();

// Student route — must be before /:id to avoid Express treating "my-status" as an id
router.get('/my-status', requireAuth, getMyRoundStatus);

// Admin routes
router.get('/', requireAuth, requireAdmin, listRounds);
router.post('/', requireAuth, requireAdmin, createRound);
router.post('/:id/activate', requireAuth, requireAdmin, activateRound);
router.post('/:id/process', requireAuth, requireAdmin, processRound);
router.post('/:id/process-and-advance', requireAuth, requireAdmin, processAndAdvance);
router.get('/:id/students', requireAuth, requireAdmin, getRoundStudents);
router.get('/:id/results', requireAuth, requireAdmin, getRoundResults);

export default router;
