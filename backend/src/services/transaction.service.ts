import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { TransactionWithCategory } from '../db/db-transaction-client.interface.ts';
import type { CreateTransactionInput } from '../dtos/input/transaction.input.ts';
import type { TransactionPage } from '../models/transaction-page.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';

export class TransactionService {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		private readonly categoryRepository: CategoryRepository,
	) {}

	async create(
		userId: string,
		{ amount, type, description, date, categoryId }: CreateTransactionInput,
	): Promise<TransactionWithCategory> {
		const category = await this.categoryRepository.findById(categoryId);
		if (!category || category.userId !== userId) {
			throw new GraphQLError('Category not found', {
				extensions: { code: ERROR_CODES.CATEGORY_NOT_FOUND },
			});
		}

		return this.transactionRepository.create({
			amount,
			type,
			description,
			date,
			categoryId,
			userId,
		});
	}

	async findPage(
		userId: string,
		{ page, pageSize }: { page: number; pageSize: number },
	): Promise<TransactionPage> {
		const skip = (page - 1) * pageSize;
		const [items, totalCount] = await Promise.all([
			this.transactionRepository.findMany(userId, { skip, take: pageSize }),
			this.transactionRepository.count(userId),
		]);

		return { items, totalCount, page, pageSize };
	}
}
