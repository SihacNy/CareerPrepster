import { z } from 'zod';

export const googleAuthSchema = z.object({
  accessToken: z.string().min(10, 'Google access token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
