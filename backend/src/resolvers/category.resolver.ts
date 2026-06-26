import { createCategorySchema } from '@financy/shared';
import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { CreateCategoryInput } from '../dtos/input/category.input.ts';
import { Validate } from '../middlewares/validate.middleware.ts';
import { CategoryModel } from '../models/category.model.ts';
import type { CategoryService } from '../services/category.service.ts';

@Resolver(() => CategoryModel)
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Mutation(() => CategoryModel)
	@UseMiddleware(Validate(createCategorySchema))
	async createCategory(
		@Arg('data', () => CreateCategoryInput)
		data: CreateCategoryInput,
	): Promise<CategoryModel> {
		return this.categoryService.create(data);
	}
}
