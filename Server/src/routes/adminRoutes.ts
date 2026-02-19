import { Router } from 'express';
import multer from 'multer';
import { uploadCsvPreview, confirmCsvImport } from '../controllers/csvController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Store file in memory (we parse it immediately, no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.post('/csv/upload', requireAuth, requireAdmin, upload.single('file'), uploadCsvPreview);
router.post('/csv/confirm', requireAuth, requireAdmin, confirmCsvImport);

export default router;
