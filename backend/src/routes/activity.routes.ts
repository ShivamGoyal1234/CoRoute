import { Router } from 'express';
import {
  createActivity,
  getActivitiesByDay,
  getActivityById,
  updateActivity,
  reorderActivities,
  deleteActivity,
} from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, canEdit } from '../middleware/permission.middleware';
import { validateActivity } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/', canEdit, validateActivity, createActivity);
router.get('/day/:dayId', canView, getActivitiesByDay);
router.get('/:id', canView, getActivityById);
router.put('/:id', canEdit, updateActivity);
router.post('/reorder', canEdit, reorderActivities);
router.delete('/:id', canEdit, deleteActivity);

export default router;
