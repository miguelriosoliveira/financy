import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { CategoryService } from './category.service.ts';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

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
				userId: USER_ID,
				...input,
			} satisfies CategoryModel;
			mockCategoryRepository.findByName.mockResolvedValueOnce(null);
			mockCategoryRepository.create.mockResolvedValueOnce(category);

			const result = await categoryService.create(USER_ID, input);

			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(USER_ID, input.name);
			expect(mockCategoryRepository.create).toHaveBeenCalledWith({ ...input, userId: USER_ID });
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
				userId: USER_ID,
				...input,
			} satisfies CategoryModel;
			mockCategoryRepository.findByName.mockResolvedValueOnce(existing);

			const error = await categoryService.create(USER_ID, input).catch(error => error);
			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category already exists');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_ALREADY_EXISTS);
			expect(mockCategoryRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('returns all categories for the user from the repository', async () => {
			const categories = [
				{
					id: 'uuid-1',
					userId: USER_ID,
					name: 'Food',
					description: 'Groceries and dining',
					icon: 'utensils',
					color: '#ff0000',
				},
				{
					id: 'uuid-2',
					userId: USER_ID,
					name: 'Transport',
					description: null,
					icon: 'car',
					color: '#0000ff',
				},
			] satisfies CategoryModel[];
			mockCategoryRepository.findAll.mockResolvedValueOnce(categories);

			const result = await categoryService.findAll(USER_ID);

			expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(USER_ID);
			expect(result).toBe(categories);
		});
	});

	describe('update', () => {
		const categoryId = 'uuid-1';
		const existing = {
			id: categoryId,
			userId: USER_ID,
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		const updateData = {
			name: 'Groceries',
			description: 'Weekly groceries',
			icon: 'shopping-cart',
			color: '#00ff00',
		};

		it('updates an owned category and returns it', async () => {
			const updated = { ...existing, ...updateData } satisfies CategoryModel;
			mockCategoryRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.findByName.mockResolvedValueOnce(null);
			mockCategoryRepository.update.mockResolvedValueOnce(updated);

			const result = await categoryService.update(USER_ID, categoryId, updateData);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(USER_ID, updateData.name);
			expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updateData);
			expect(result).toBe(updated);
		});

		it('throws CATEGORY_NOT_FOUND when the id does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce(null);

			const error = await categoryService
				.update(USER_ID, categoryId, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockCategoryRepository.update).not.toHaveBeenCalled();
		});

		it('throws CATEGORY_NOT_FOUND when owned by another user', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce({
				...existing,
				userId: OTHER_USER_ID,
			});

			const error = await categoryService
				.update(USER_ID, categoryId, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockCategoryRepository.update).not.toHaveBeenCalled();
		});

		it('rejects a rename that collides with another of the user categories', async () => {
			const collision = {
				id: 'uuid-2',
				userId: USER_ID,
				name: 'Groceries',
				description: null,
				icon: 'cart',
				color: '#111111',
			} satisfies CategoryModel;
			mockCategoryRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.findByName.mockResolvedValueOnce(collision);

			const error = await categoryService
				.update(USER_ID, categoryId, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category already exists');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_ALREADY_EXISTS);
			expect(mockCategoryRepository.update).not.toHaveBeenCalled();
		});
	});
});
