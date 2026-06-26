import type { CreateCategoryInput } from '../dtos/input/category.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';

export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async create({ name, description, icon, color }: CreateCategoryInput): Promise<CategoryModel> {
		const existing = await this.categoryRepository.findByName(name);
		if (existing) {
			throw new Error('Category already exists');
		}
		return this.categoryRepository.create({ name, description, icon, color });
	}
}
