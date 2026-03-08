import { Router } from 'express';
import { register, login, getMe, updateProfile, uploadAvatar } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRegister, validateLogin } from '../utils/validators';

const router = Router();

router.post('/register', uploadAvatar.single('avatar'), validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
