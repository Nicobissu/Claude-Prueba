import express from 'express';
import { createComment, getCommentsBySolPed } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createComment);
router.get('/solped/:solPedId', getCommentsBySolPed);

export default router;
