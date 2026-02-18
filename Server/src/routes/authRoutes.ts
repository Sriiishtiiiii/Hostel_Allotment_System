import { Router } from 'express';
import { getProfile, syncUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/sync', requireAuth, syncUser);
router.get('/profile', requireAuth, getProfile);

export default router;
