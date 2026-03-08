import { Router, RequestHandler } from 'express';
import {
  uploadAttachment,
  getAttachmentsByActivity,
  deleteAttachment,
  upload,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView } from '../middleware/permission.middleware';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file') as unknown as RequestHandler, uploadAttachment);
router.get('/activity/:activityId', canView, getAttachmentsByActivity);
router.delete('/:id', authenticate, deleteAttachment);

export default router;
