import type { ListTransactionFiltersInputType } from '@financy/shared';
import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type {
	TransactionListFilters,
	TransactionWithCategory,
} from '../db/db-transaction-client.interface.ts';
import type {
	CreateTransactionInput,
	UpdateTransactionInput,
} from '../dtos/input/transaction.input.ts';
import type { TransactionPeriodOutput } from '../dtos/output/transaction-period.output.ts';
import type { TransactionPage } from '../models/transaction-page.model.ts';
import type { TransactionType } from '../models/transaction-type.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { getMonthRange } from '../utils/date-range.ts';

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

	async update(
		userId: string,
		id: string,
		{ amount, type, description, date, categoryId }: UpdateTransactionInput,
	): Promise<TransactionWithCategory> {
		const transaction = await this.transactionRepository.findById(id);
		if (!transaction || transaction.userId !== userId) {
			throw new GraphQLError('Transaction not found', {
				extensions: { code: ERROR_CODES.TRANSACTION_NOT_FOUND },
			});
		}

		const category = await this.categoryRepository.findById(categoryId);
		if (!category || category.userId !== userId) {
			throw new GraphQLError('Category not found', {
				extensions: { code: ERROR_CODES.CATEGORY_NOT_FOUND },
			});
		}

		return this.transactionRepository.update(id, {
			amount,
			type,
			description,
			date,
			categoryId,
		});
	}

	async delete(userId: string, id: string): Promise<TransactionWithCategory> {
		const transaction = await this.transactionRepository.findById(id);
		if (!transaction || transaction.userId !== userId) {
			throw new GraphQLError('Transaction not found', {
				extensions: { code: ERROR_CODES.TRANSACTION_NOT_FOUND },
			});
		}

		return this.transactionRepository.delete(id);
	}

	async findPage(
		userId: string,
		{
			page,
			pageSize,
			filters,
		}: { page: number; pageSize: number; filters?: ListTransactionFiltersInputType },
	): Promise<TransactionPage> {
		const resolvedFilters = resolveTransactionListFilters(filters);
		const skip = (page - 1) * pageSize;
		const [items, totalCount] = await Promise.all([
			this.transactionRepository.findMany(userId, {
				skip,
				take: pageSize,
				filters: resolvedFilters,
			}),
			this.transactionRepository.count(userId, resolvedFilters),
		]);

		return { items, totalCount, page, pageSize };
	}

	async findDistinctPeriods(userId: string): Promise<TransactionPeriodOutput[]> {
		return this.transactionRepository.findDistinctPeriods(userId);
	}
}

function resolveTransactionListFilters(
	filters?: ListTransactionFiltersInputType,
): TransactionListFilters | undefined {
	if (!filters) {
		return undefined;
	}

	const resolved: TransactionListFilters = {
		...(filters.search ? { search: filters.search } : {}),
		...(filters.type ? { type: filters.type as TransactionType } : {}),
		...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
		...(filters.period
			? { dateRange: getMonthRange(filters.period.year, filters.period.month) }
			: {}),
	};

	return Object.keys(resolved).length > 0 ? resolved : undefined;
}
