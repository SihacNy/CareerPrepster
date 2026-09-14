import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ATSController } from '../controllers/ats.controller.js';
import { validate } from '../middlewares/validate.js';
import { scoreCvSchema } from '../schemas/ats.schema.js';
import { env } from '../config/env.js';
import { AuthUser } from '../middlewares/requireAuth.js';

const router = Router();

// Optional auth helper: attaches req.user if token is valid, but doesn't block if absent
const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

router.post('/score', optionalAuth, validate(scoreCvSchema), ATSController.scoreCv);

export const atsRoutes = router;
