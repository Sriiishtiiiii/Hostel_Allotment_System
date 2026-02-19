import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { submitPreferences, getMyPreferences } from '../controllers/preferenceController.js';

const router = Router();

router.get('/me', requireAuth, getMyPreferences);
router.post('/', requireAuth, submitPreferences);

export default router;
