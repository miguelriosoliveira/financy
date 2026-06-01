import type { Secret } from 'jsonwebtoken';
import z from 'zod';

export const env = z
	.object({
		PORT: z.coerce.number(),
		JWT_SECRET: z
			.string()
			.nonempty()
			.transform(val => val as Secret),
		DATABASE_URL: z.url().startsWith('file:'),
	})
	.parse(process.env);
