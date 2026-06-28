import { createCategorySchema, updateCategorySchema } from '@financy/shared';
import { Arg, Authorized, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { UserInfo } from '../auth/user-info.decorator.ts';
import { CreateCategoryInput, UpdateCategoryInput } from '../dtos/input/category.input.ts';
import { Validate } from '../middlewares/validate.middleware.ts';
import { CategoryModel } from '../models/category.model.ts';
import type { CategoryService } from '../services/category.service.ts';
import type { JwtPayload } from '../services/jwt.service.ts';

@Authorized()
@Resolver(() => CategoryModel)
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Mutation(() => CategoryModel)
	@UseMiddleware(Validate(createCategorySchema))
	async createCategory(
		@Arg('data', () => CreateCategoryInput)
		data: CreateCategoryInput,
		@UserInfo() user: JwtPayload,
	): Promise<CategoryModel> {
		return this.categoryService.create(user.id, data);
	}

	@Query(() => [CategoryModel])
	async getCategories(@UserInfo() user: JwtPayload): Promise<CategoryModel[]> {
		return this.categoryService.findAll(user.id);
	}

	@Mutation(() => CategoryModel)
	@UseMiddleware(Validate(updateCategorySchema))
	async editCategory(
		@Arg('id', () => ID) id: string,
		@Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
		@UserInfo() user: JwtPayload,
	): Promise<CategoryModel> {
		return this.categoryService.update(user.id, id, data);
	}
}
