import express from 'express';
import { body } from 'express-validator';
import {
  authorityLogin,
  acceptInvitation,
  getAuthorityDashboard,
  getAuthorityReports,
  updateReportStatus,
  assignReport,
  addProgressNote,
  uploadResolutionEvidence
} from '../controllers/authorityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAuthority, requirePermission, requireDepartmentAccess } from '../middleware/roleMiddleware.js';
import { PERMISSIONS } from '../config/constants.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Authority Login & Invitation Acceptance (Public endpoints)
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Official email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  authorityLogin
);

router.post(
  '/accept-invitation',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Invitation token is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('confirmPassword').notEmpty().withMessage('Password confirmation is required.')
  ],
  validate,
  acceptInvitation
);

// Protected Authority Operations
router.use(authenticateToken);
router.use(requireAuthority);

router.get('/dashboard', getAuthorityDashboard);

router.get(
  '/reports',
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  getAuthorityReports
);

router.patch(
  '/reports/:id/status',
  requirePermission(PERMISSIONS.REPORTS_UPDATE_STATUS),
  [
    body('status').notEmpty().withMessage('Status is required.'),
    body('explanation').trim().notEmpty().withMessage('Status change explanation is mandatory for municipal auditability.')
  ],
  validate,
  updateReportStatus
);

router.patch(
  '/reports/:id/assign',
  requirePermission(PERMISSIONS.REPORTS_ASSIGN),
  [body('departmentId').notEmpty().withMessage('Department ID is required.')],
  validate,
  assignReport
);

router.post(
  '/reports/:id/notes',
  requirePermission(PERMISSIONS.REPORTS_ADD_NOTES),
  [body('note').trim().notEmpty().withMessage('Note content is required.')],
  validate,
  addProgressNote
);

router.post(
  '/reports/:id/resolution-evidence',
  requirePermission(PERMISSIONS.REPORTS_UPLOAD_EVIDENCE),
  upload.single('image'),
  uploadResolutionEvidence
);

export default router;
