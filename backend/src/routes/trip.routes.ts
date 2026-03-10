import { Router } from 'express';
import type { RequestHandler } from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  getTripFeed,
  sendTripMessage,
  uploadMessageImage,
  updateTrip,
  deleteTrip,
  getTripStats,
} from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, canEdit, isOwner } from '../middleware/permission.middleware';
import { validateTrip } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/', validateTrip, createTrip);
router.get('/', getTrips);
router.get('/:id', canView, getTripById);
router.get('/:id/feed', canView, getTripFeed);
router.post(
  '/:id/messages',
  canView,
  uploadMessageImage as unknown as RequestHandler,
  sendTripMessage
);
router.put('/:id', canEdit, validateTrip, updateTrip);
router.delete('/:id', isOwner, deleteTrip);
router.get('/:id/stats', canView, getTripStats);

export default router;
