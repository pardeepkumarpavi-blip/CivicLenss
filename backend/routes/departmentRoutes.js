import express from 'express';
import { body } from 'express-validator';
import {
  getDepartments,
  createDepartment,
  updateDepartment
} from '../controllers/departmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/constants.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Publicly readable active departments
router.get('/', getDepartments);

// Admin-only department configuration
router.post(
  '/',
  authenticateToken,
  requireRole(ROLES.SUPER_ADMIN, ROLES.MUNICIPAL_ADMIN),
  [
    body('name').trim().notEmpty().withMessage('Department name is required.'),
    body('code').trim().notEmpty().withMessage('Department code is required.')
  ],
  validate,
  createDepartment
);

router.patch(
  '/:id',
  authenticateToken,
  requireRole(ROLES.SUPER_ADMIN, ROLES.MUNICIPAL_ADMIN),
  updateDepartment
);

export default router;
