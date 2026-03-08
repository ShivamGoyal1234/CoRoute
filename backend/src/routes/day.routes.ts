import { Router } from 'express';
import {
  createDay,
  getDaysByTrip,
  getDayById,
  updateDay,
  deleteDay,
} from '../controllers/day.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, canEdit } from '../middleware/permission.middleware';
import { validateDay } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', canEdit, validateDay, createDay);
router.get('/trip/:tripId', canView, getDaysByTrip);
router.get('/:id', canView, getDayById);
router.put('/:id', canEdit, updateDay);
router.delete('/:id', canEdit, deleteDay);

export default router;
