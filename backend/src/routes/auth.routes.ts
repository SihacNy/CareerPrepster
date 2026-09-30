import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { googleAuthSchema } from '../schemas/auth.schema.js';

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';

const router = Router();

router.post('/google', validate(googleAuthSchema), AuthController.googleLogin);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', AuthController.logout);

// Development authentication bypass for Postman and local testing
router.post('/dev-login', async (req, res, next) => {
  try {
    if (env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Dev login disabled in production' });
    }

    const email = req.body.email || 'guest_1789555828066@example.com';
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'student_demo@example.com',
          name: 'Student Demo',
        },
      });
    }

    const token = AuthService.generateToken(user.id, user.email);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Dev login successful. Token cookie set and returned in payload.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export const authRoutes = router;

