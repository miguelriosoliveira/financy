import { z } from 'zod';

export const createTransactionSchema = z.object({
	amount: z.number().positive('Amount must be greater than zero'),
	type: z.enum(['INCOME', 'EXPENSE']),
	description: z.string().trim().optional(),
	date: z.coerce.date(),
	categoryId: z.string().trim().min(1, 'Category is required'),
});
export type CreateTransactionInputType = z.infer<typeof createTransactionSchema>;

export const transactionPeriodSchema = z.object({
	year: z.number().int().min(1970).max(2100),
	month: z.number().int().min(1).max(12),
});
export type TransactionPeriodInputType = z.infer<typeof transactionPeriodSchema>;

export type ListTransactionFiltersInputType = {
	search?: string;
	type?: 'INCOME' | 'EXPENSE';
	categoryId?: string;
	period?: TransactionPeriodInputType;
};

export const listTransactionFiltersSchema: z.ZodType<ListTransactionFiltersInputType> = z
	.object({
		search: z.string().trim().optional(),
		type: z.enum(['INCOME', 'EXPENSE']).optional(),
		categoryId: z.string().trim().min(1).optional(),
		period: transactionPeriodSchema.optional(),
	})
	.transform(filters => ({
		...(filters.search && filters.search !== '' ? { search: filters.search } : {}),
		...(filters.type ? { type: filters.type } : {}),
		...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
		...(filters.period ? { period: filters.period } : {}),
	}));

export const listTransactionsSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(10),
	filters: listTransactionFiltersSchema.optional(),
});
export type ListTransactionsInputType = z.infer<typeof listTransactionsSchema>;

export const updateTransactionSchema = createTransactionSchema;
export type UpdateTransactionInputType = z.infer<typeof updateTransactionSchema>;
