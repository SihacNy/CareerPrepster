import { z } from 'zod';

export const googleAuthSchema = z.object({
  idToken: z.string().min(10, 'Google ID token is required'),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
