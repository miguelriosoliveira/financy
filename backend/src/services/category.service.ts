import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';

export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

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

	async findAll(userId: string): Promise<CategoryModel[]> {
		return this.categoryRepository.findAll(userId);
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
}
