import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { CategoryService } from './category.service.ts';

describe('CategoryService', () => {
	let categoryService: CategoryService;
	let mockCategoryRepository: Mocked<CategoryRepository>;

	beforeEach(() => {
		mockCategoryRepository = mockOf<CategoryRepository>();
		categoryService = new CategoryService(mockCategoryRepository);
	});

	describe('create', () => {
		it('creates a category and returns it', async () => {
			const input = {
				name: 'Food',
				description: 'Groceries and dining',
				icon: 'utensils',
				color: '#ff0000',
			};
			const category = {
				id: 'uuid-1',
				...input,
			} satisfies CategoryModel;
			mockCategoryRepository.findByName.mockResolvedValueOnce(null);
			mockCategoryRepository.create.mockResolvedValueOnce(category);

			const result = await categoryService.create(input);

			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(input.name);
			expect(mockCategoryRepository.create).toHaveBeenCalledWith(input);
			expect(result).toBe(category);
		});

		it('throws when a category with the same name already exists', async () => {
			const input = {
				name: 'Food',
				description: 'Groceries and dining',
				icon: 'utensils',
				color: '#ff0000',
			};
			const existing = {
				id: 'uuid-1',
				...input,
			} satisfies CategoryModel;
			mockCategoryRepository.findByName.mockResolvedValueOnce(existing);

			const error = await categoryService.create(input).catch(error => error);
			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category already exists');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_ALREADY_EXISTS);
			expect(mockCategoryRepository.create).not.toHaveBeenCalled();
		});
	});
});
