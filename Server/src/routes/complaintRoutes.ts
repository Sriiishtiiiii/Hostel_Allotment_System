import express from 'express';
import {
  getComplaints,
  createComplaint
} from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', createComplaint);

export default router;
