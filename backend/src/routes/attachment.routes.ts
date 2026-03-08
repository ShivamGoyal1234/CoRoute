import { Router } from 'express';
import {
  uploadAttachment,
  getAttachmentsByActivity,
  deleteAttachment,
  upload,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView } from '../middleware/permission.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('file'), uploadAttachment);
router.get('/activity/:activityId', canView, getAttachmentsByActivity);
router.delete('/:id', authenticate, deleteAttachment);

export default router;
