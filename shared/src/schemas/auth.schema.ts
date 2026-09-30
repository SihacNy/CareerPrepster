import { z } from 'zod';

export const googleAuthSchema = z
  .object({
    idToken: z.string().optional(),
    accessToken: z.string().optional(),
  })
  .refine((data) => Boolean(data.idToken || data.accessToken), {
    message: 'Google token (idToken or accessToken) is required',
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
