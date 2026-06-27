import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { CreateCategoryInput } from '../dtos/input/category.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';

export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async create({ name, description, icon, color }: CreateCategoryInput): Promise<CategoryModel> {
		const existing = await this.categoryRepository.findByName(name);
		if (existing) {
			throw new GraphQLError('Category already exists', {
				extensions: { code: ERROR_CODES.CATEGORY_ALREADY_EXISTS },
			});
		}
		return this.categoryRepository.create({ name, description, icon, color });
	}

	async findAll(): Promise<CategoryModel[]> {
		return this.categoryRepository.findAll();
	}
}
