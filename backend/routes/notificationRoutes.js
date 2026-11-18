import express from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/mark-all-read', markAllNotificationsRead);

export default router;
