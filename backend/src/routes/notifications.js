import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.get('/count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
