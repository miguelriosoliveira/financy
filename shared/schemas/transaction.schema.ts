import { z } from 'zod';

export const createTransactionSchema = z.object({
	amount: z.number().positive('Amount must be greater than zero'),
	type: z.enum(['INCOME', 'EXPENSE']),
	description: z.string().trim().optional(),
	date: z.coerce.date(),
	categoryId: z.string().trim().min(1, 'Category is required'),
});
export type CreateTransactionInputType = z.infer<typeof createTransactionSchema>;
