import { Router } from 'express';
import {
  createChecklistItem,
  getChecklistByTrip,
  updateChecklistItem,
  deleteChecklistItem,
} from '../controllers/checklist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, canEdit } from '../middleware/permission.middleware';
import { validateChecklist } from '../utils/validators';
import Checklist from '../models/Checklist';

const router = Router();

const withChecklistTripId = async (req: any, res: any, next: any) => {
  try {
    const item = await Checklist.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }
    (req.body ??= {}).tripId = item.tripId.toString();
    next();
  } catch (err) {
    next(err);
  }
};

router.use(authenticate);

router.post('/', canEdit, validateChecklist, createChecklistItem);
router.get('/trip/:tripId', canView, getChecklistByTrip);
router.put('/:id', withChecklistTripId, canEdit, updateChecklistItem);
router.delete('/:id', withChecklistTripId, canEdit, deleteChecklistItem);

export default router;
