import { Router } from 'express';
import {
  uploadTripFile,
  getTripFiles,
  deleteTripFile,
  upload,
} from '../controllers/tripFile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView, canEdit } from '../middleware/permission.middleware';
import TripFile from '../models/TripFile';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), canEdit, uploadTripFile);
router.get('/trip/:tripId', canView, getTripFiles);
router.delete('/:id', async (req, res, next) => {
  try {
    const file = await TripFile.findById(req.params.id);
    if (file) {
      (req as { body?: { tripId?: string } }).body = { ...(req.body || {}), tripId: file.tripId.toString() };
    }
    next();
  } catch {
    next();
  }
}, canEdit, deleteTripFile);

export default router;
