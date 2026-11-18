import express from 'express';
import { body } from 'express-validator';
import {
  createAuthorityInvitation,
  getAuthorityInvitations,
  revokeAuthorityInvitation,
  getAuthorities,
  updateAuthority,
  getAuditLogs,
  getSystemHealth
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
// Super Admin and Municipal Admin access
router.use(requireRole(ROLES.SUPER_ADMIN, ROLES.MUNICIPAL_ADMIN));

router.post(
  '/authority-invitations',
  [
    body('officialName').trim().notEmpty().withMessage('Official name is required.'),
    body('officialEmail').isEmail().normalizeEmail().withMessage('Valid official email is required.'),
    body('organization').trim().notEmpty().withMessage('Organization is required.'),
    body('departmentId').notEmpty().withMessage('Department is required.'),
    body('designation').trim().notEmpty().withMessage('Designation is required.'),
    body('role').notEmpty().withMessage('Authority role is required.')
  ],
  validate,
  createAuthorityInvitation
);

router.get('/authority-invitations', getAuthorityInvitations);
router.delete('/authority-invitations/:id', revokeAuthorityInvitation);

router.get('/authorities', getAuthorities);
router.patch('/authorities/:id', updateAuthority);

router.get('/audit-logs', getAuditLogs);
router.get('/system-health', getSystemHealth);

export default router;
