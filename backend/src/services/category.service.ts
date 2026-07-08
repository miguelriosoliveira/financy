import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import { TransactionType } from '../models/transaction-type.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { getCurrentMonthRange } from '../utils/date-range.ts';

export class CategoryService {
	constructor(
		private readonly categoryRepository: CategoryRepository,
		private readonly transactionRepository: TransactionRepository,
	) {}

	async create(
		userId: string,
		{ name, description, icon, color }: CreateCategoryInput,
	): Promise<CategoryModel> {
		const existing = await this.categoryRepository.findByName(userId, name);
		if (existing) {
			throw new GraphQLError('Category already exists', {
				extensions: { code: ERROR_CODES.CATEGORY_ALREADY_EXISTS },
			});
		}
		return this.categoryRepository.create({ name, description, icon, color, userId });
	}

	async findAll(userId: string, options?: { includeStats?: boolean }): Promise<CategoryModel[]> {
		const categories = await this.categoryRepository.findAll(userId);

		if (!options?.includeStats) {
			return categories;
		}

		const aggregations = await this.transactionRepository.groupByCategory(
			userId,
			getCurrentMonthRange(),
			TransactionType.EXPENSE,
		);
		const aggregationByCategoryId = new Map(
			aggregations.map(aggregation => [aggregation.categoryId, aggregation]),
		);

		return categories.map(category => {
			const aggregation = aggregationByCategoryId.get(category.id);

			return {
				...category,
				transactionCount: aggregation?.transactionCount ?? 0,
				totalAmount: aggregation?.totalAmount ?? 0,
			};
		});
	}

	async update(
		userId: string,
		id: string,
		{ name, description, icon, color }: UpdateCategoryInput,
	): Promise<CategoryModel> {
		const category = await this.categoryRepository.findById(id);
		if (!category || category.userId !== userId) {
			throw new GraphQLError('Category not found', {
				extensions: { code: ERROR_CODES.CATEGORY_NOT_FOUND },
			});
		}

		if (name !== category.name) {
			const existing = await this.categoryRepository.findByName(userId, name);
			if (existing) {
				throw new GraphQLError('Category already exists', {
					extensions: { code: ERROR_CODES.CATEGORY_ALREADY_EXISTS },
				});
			}
		}

		return this.categoryRepository.update(id, { name, description, icon, color });
	}

	async delete(userId: string, id: string): Promise<CategoryModel> {
		const category = await this.categoryRepository.findById(id);
		if (!category || category.userId !== userId) {
			throw new GraphQLError('Category not found', {
				extensions: { code: ERROR_CODES.CATEGORY_NOT_FOUND },
			});
		}

		return this.categoryRepository.delete(id);
	}
}
