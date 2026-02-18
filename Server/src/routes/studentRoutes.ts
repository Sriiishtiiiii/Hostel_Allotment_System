import express from 'express';
import {
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getStudents);
router.get('/:id', requireAuth, getStudent);

router.put('/:id', requireAuth, updateStudent);
router.delete('/:id', requireAuth, deleteStudent);

export default router;
