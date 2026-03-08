import { Router } from 'express';
import {
  createComment,
  getCommentsByActivity,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { canView } from '../middleware/permission.middleware';
import { validateComment } from '../utils/validators';

const router = Router();

router.use(authenticate); 

router.post('/', canView, validateComment, createComment);
router.get('/activity/:activityId', canView, getCommentsByActivity);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
