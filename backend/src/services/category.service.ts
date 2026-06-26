import type { CategoryCreateProps } from '../db/db-category-client.interface.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';

export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async create({ name, description, icon, color }: CategoryCreateProps): Promise<CategoryModel> {
		return this.categoryRepository.create({ name, description, icon, color });
	}
}
