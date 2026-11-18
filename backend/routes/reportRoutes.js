import express from 'express';
import { body } from 'express-validator';
import {
  createReport,
  getMyReports,
  getPublicReports,
  getReportById,
  verifyResolution,
  reopenReport
} from '../controllers/reportController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { reportCreationLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public reports list (for homepage and public map)
router.get('/', optionalAuthenticateToken, getPublicReports);

// Citizen's personal reports
router.get('/my-reports', authenticateToken, getMyReports);

// Create report
router.post(
  '/',
  authenticateToken,
  reportCreationLimiter,
  upload.single('image'),
  [
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('issueCategory').notEmpty().withMessage('Issue category is required.'),
    body('locationAddress').trim().notEmpty().withMessage('Location address is required.'),
    body('area').trim().notEmpty().withMessage('Area or neighborhood is required.')
  ],
  validate,
  createReport
);

// Get single report
router.get('/:id', optionalAuthenticateToken, getReportById);

// Citizen resolution verification
router.post(
  '/:id/verify-resolution',
  authenticateToken,
  [body('confirmed').isBoolean().withMessage('Confirmation decision (true/false) is required.')],
  validate,
  verifyResolution
);

// Reopen report
router.post(
  '/:id/reopen',
  authenticateToken,
  [body('explanation').trim().notEmpty().withMessage('Explanation is required to reopen a complaint.')],
  validate,
  reopenReport
);

export default router;
