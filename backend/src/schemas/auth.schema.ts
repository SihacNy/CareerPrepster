import { z } from 'zod';

export const googleAuthSchema = z.object({
  idToken: z.string().min(10, 'Google ID token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

