import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async googleAuth(idToken: string) {
    logger.debug('AuthService', 'Google OAuth login attempt received');

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (error: any) {
      logger.error('AuthService', 'Google token verification failed', error);
      throw new AppError(`Google authentication failed: ${error.message || 'Invalid token'}`, 401, 'INVALID_GOOGLE_TOKEN');
    }

    if (!payload || !payload.email) {
      logger.warn('AuthService', 'Google token verified but email is missing');
      throw new AppError('Google account does not contain a verified email address', 400, 'INVALID_PAYLOAD');
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.email.split('@')[0];
    const avatarUrl = payload.picture || null;

    // Check if user already exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (user) {
      // Link Google ID or update avatar if not already set
      if (!user.googleId || !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleId,
            avatarUrl: user.avatarUrl || avatarUrl,
          },
        });
      }
      logger.info('AuthService', `Existing user logged in via Google OAuth [${user.email}]`, { userId: user.id });
    } else {
      // Create new user with Google OAuth
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl,
        },
      });
      logger.info('AuthService', `New user registered via Google OAuth [${user.email}]`, { userId: user.id });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      logger.warn('AuthService', `getMe failed: User ID not found in database [${userId}]`);
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  static generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}
