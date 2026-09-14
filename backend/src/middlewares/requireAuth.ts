import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface AuthUser {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn('AuthGuard', `Access denied: No token provided on ${req.method} ${req.originalUrl}`, {
      hasCookie: Boolean(req.cookies?.token),
      hasAuthHeader: Boolean(req.headers.authorization),
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. No session token provided.',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    return next();
  } catch (err: any) {
    logger.warn('AuthGuard', `Token verification failed: ${err.message}`, {
      url: req.originalUrl,
      reason: err.name,
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session token. Please sign in again.',
      },
    });
  }
};
