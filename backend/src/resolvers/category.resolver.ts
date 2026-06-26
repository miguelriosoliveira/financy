import { Arg, Mutation, Resolver } from 'type-graphql';
import { CategoryModel } from '../models/category.model.ts';
import type { CategoryService } from '../services/category.service.ts';

@Resolver(() => CategoryModel)
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Mutation(() => CategoryModel)
	async createCategory(
		@Arg('name', () => String) name: string,
		@Arg('description', () => String) description: string,
		@Arg('icon', () => String) icon: string,
		@Arg('color', () => String) color: string,
	): Promise<CategoryModel> {
		return this.categoryService.create({ name, description, icon, color });
	}
}
