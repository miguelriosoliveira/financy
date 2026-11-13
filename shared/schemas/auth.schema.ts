import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.email('Invalid email').trim().toLowerCase(),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInputType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
	email: z.email('Invalid email').trim().toLowerCase(),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInputType = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
	refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

export type RefreshTokenInputType = z.infer<typeof refreshTokenSchema>;
