import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
