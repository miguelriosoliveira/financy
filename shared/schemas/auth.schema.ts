import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.email('Invalid email').trim().toLowerCase(),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInputType = z.infer<typeof registerSchema>;
