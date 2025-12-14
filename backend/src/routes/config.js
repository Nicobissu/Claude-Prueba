import express from 'express';
import {
  getAllAreas,
  createArea,
  updateArea,
  deleteArea,
  getAllUnits,
  createUnit,
  updateUnit,
  deleteUnit
} from '../controllers/configController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Áreas - todos pueden ver
router.get('/areas', getAllAreas);

// Áreas - solo admin puede modificar
router.post('/areas', authorizeRoles('ADMIN', 'ADMINISTRACION'), createArea);
router.put('/areas/:id', authorizeRoles('ADMIN', 'ADMINISTRACION'), updateArea);
router.delete('/areas/:id', authorizeRoles('ADMIN'), deleteArea);

// Unidades - todos pueden ver
router.get('/units', getAllUnits);

// Unidades - solo admin puede modificar
router.post('/units', authorizeRoles('ADMIN', 'ADMINISTRACION'), createUnit);
router.put('/units/:id', authorizeRoles('ADMIN', 'ADMINISTRACION'), updateUnit);
router.delete('/units/:id', authorizeRoles('ADMIN'), deleteUnit);

export default router;
