import z from 'zod';

export const env = z
	.object({
		VITE_BACKEND_URL: z.url(),
	})
	.parse(import.meta.env);
