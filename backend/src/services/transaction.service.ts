import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { CreateTransactionInput } from '../dtos/input/transaction.input.ts';
import type { TransactionModel } from '../models/transaction.model.ts';
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
	): Promise<TransactionModel> {
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
}
