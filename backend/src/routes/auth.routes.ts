import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { googleAuthSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/google', validate(googleAuthSchema), AuthController.googleLogin);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', AuthController.logout);

export const authRoutes = router;
