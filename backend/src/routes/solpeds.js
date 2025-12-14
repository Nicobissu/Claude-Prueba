import express from 'express';
import {
  createSolPed,
  getAllSolPeds,
  getSolPedById,
  updateSolPed,
  updateSolPedStatus,
  updateSolPedItems,
  deleteSolPed,
  getStatistics
} from '../controllers/solpedController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/statistics', getStatistics);
router.get('/', getAllSolPeds);
router.get('/:id', getSolPedById);
router.post('/', createSolPed);
router.put('/:id', updateSolPed);
router.put('/:id/status', updateSolPedStatus);
router.put('/:id/items', updateSolPedItems);
router.delete('/:id', deleteSolPed);

export default router;
