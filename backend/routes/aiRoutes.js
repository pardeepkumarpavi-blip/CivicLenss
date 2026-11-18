import express from 'express';
import { analyzeReport } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/analyze-report',
  authenticateToken,
  upload.single('image'),
  analyzeReport
);

export default router;
