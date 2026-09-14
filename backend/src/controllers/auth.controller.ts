import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';

const COOKIE_NAME = 'token';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearAuthCookie = (res: Response) => {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
};

export class AuthController {
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.googleAuth(req.body.idToken);
      setAuthCookie(res, token);
      return res.status(200).json({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async logout(_req: Request, res: Response) {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  }
}
