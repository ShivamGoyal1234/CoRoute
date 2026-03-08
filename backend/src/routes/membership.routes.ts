import { Router } from 'express';
import {
  inviteMember,
  getTripMembers,
  updateMemberRole,
  removeMember,
  leavTrip,
} from '../controllers/membership.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, isOwner } from '../middleware/permission.middleware';

const router = Router();

router.use(authenticate);

router.post('/:tripId/invite', isOwner, inviteMember);
router.get('/:tripId', canView, getTripMembers);
router.put('/:id/role', isOwner, updateMemberRole);
router.delete('/:id', isOwner, removeMember);
router.post('/:tripId/leave', authenticate, leavTrip);

export default router;
