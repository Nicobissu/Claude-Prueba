import express from 'express';
import { upload, uploadAttachment, deleteAttachment } from '../controllers/attachmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteAttachment);

export default router;
