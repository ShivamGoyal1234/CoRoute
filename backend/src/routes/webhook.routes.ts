import { Router } from 'express';
import {
  registerWebhook,
  getWebhooksByTrip,
  updateWebhook,
  deleteWebhook,
  getAvailableEvents,
} from '../controllers/webhook.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isOwner, canView } from '../middleware/permission.middleware';
import { validateWebhook } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/events', getAvailableEvents);
router.post('/', isOwner, validateWebhook, registerWebhook);
router.get('/trip/:tripId', canView, getWebhooksByTrip);
router.put('/:id', isOwner, updateWebhook);
router.delete('/:id', isOwner, deleteWebhook);

export default router;
