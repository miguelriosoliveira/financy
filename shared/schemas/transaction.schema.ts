import { z } from 'zod';

export const createTransactionSchema = z.object({
	amount: z.number().positive('Amount must be greater than zero'),
	type: z.enum(['INCOME', 'EXPENSE']),
	description: z.string().trim().optional(),
	date: z.coerce.date(),
	categoryId: z.string().trim().min(1, 'Category is required'),
});
export type CreateTransactionInputType = z.infer<typeof createTransactionSchema>;

export const listTransactionsSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
});
export type ListTransactionsInputType = z.infer<typeof listTransactionsSchema>;

export const updateTransactionSchema = createTransactionSchema;
export type UpdateTransactionInputType = z.infer<typeof updateTransactionSchema>;
