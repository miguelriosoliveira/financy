import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { CategoryModel } from '../models/category.model.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { CategoryService } from './category.service.ts';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

describe('CategoryService', () => {
	let categoryService: CategoryService;
	let mockCategoryRepository: Mocked<CategoryRepository>;
	let mockTransactionRepository: Mocked<TransactionRepository>;

	beforeEach(() => {
		mockCategoryRepository = mockOf<CategoryRepository>();
		mockTransactionRepository = mockOf<TransactionRepository>();
		categoryService = new CategoryService(mockCategoryRepository, mockTransactionRepository);
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

	describe('getSummary', () => {
		const foodCategory = {
			id: 'uuid-food',
			userId: USER_ID,
			name: 'Food',
			description: null,
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		const transportCategory = {
			id: 'uuid-transport',
			userId: USER_ID,
			name: 'Transport',
			description: null,
			icon: 'car',
			color: '#0000ff',
		} satisfies CategoryModel;

		it('returns zero total and null most-used category when there are no transactions', async () => {
			mockCategoryRepository.findAll.mockResolvedValueOnce([foodCategory]);
			mockTransactionRepository.groupByCategory.mockResolvedValueOnce([]);

			const result = await categoryService.getSummary(USER_ID);

			expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(USER_ID);
			expect(mockTransactionRepository.groupByCategory).toHaveBeenCalledWith(USER_ID);
			expect(result).toEqual({
				transactionCount: 0,
				mostUsedCategory: null,
			});
		});

		it('returns summed total and the category with the highest transaction count', async () => {
			mockCategoryRepository.findAll.mockResolvedValueOnce([foodCategory, transportCategory]);
			mockTransactionRepository.groupByCategory.mockResolvedValueOnce([
				{ categoryId: foodCategory.id, transactionCount: 3, totalAmount: 150 },
				{ categoryId: transportCategory.id, transactionCount: 1, totalAmount: 25 },
			]);

			const result = await categoryService.getSummary(USER_ID);

			expect(result).toEqual({
				transactionCount: 4,
				mostUsedCategory: {
					id: foodCategory.id,
					name: foodCategory.name,
					transactionCount: 3,
				},
			});
		});

		it('breaks ties by category name ascending', async () => {
			const alphaCategory = {
				id: 'uuid-alpha',
				userId: USER_ID,
				name: 'Alpha',
				description: null,
				icon: 'a',
				color: '#111111',
			} satisfies CategoryModel;
			const betaCategory = {
				id: 'uuid-beta',
				userId: USER_ID,
				name: 'Beta',
				description: null,
				icon: 'b',
				color: '#222222',
			} satisfies CategoryModel;

			mockCategoryRepository.findAll.mockResolvedValueOnce([betaCategory, alphaCategory]);
			mockTransactionRepository.groupByCategory.mockResolvedValueOnce([
				{ categoryId: betaCategory.id, transactionCount: 2, totalAmount: 20 },
				{ categoryId: alphaCategory.id, transactionCount: 2, totalAmount: 10 },
			]);

			const result = await categoryService.getSummary(USER_ID);

			expect(result.mostUsedCategory).toEqual({
				id: alphaCategory.id,
				name: alphaCategory.name,
				transactionCount: 2,
			});
		});

		it('breaks name ties by category id ascending', async () => {
			const categoryA = {
				id: 'uuid-a',
				userId: USER_ID,
				name: 'Same',
				description: null,
				icon: 'a',
				color: '#111111',
			} satisfies CategoryModel;
			const categoryB = {
				id: 'uuid-b',
				userId: USER_ID,
				name: 'Same',
				description: null,
				icon: 'b',
				color: '#222222',
			} satisfies CategoryModel;

			mockCategoryRepository.findAll.mockResolvedValueOnce([categoryB, categoryA]);
			mockTransactionRepository.groupByCategory.mockResolvedValueOnce([
				{ categoryId: categoryB.id, transactionCount: 2, totalAmount: 20 },
				{ categoryId: categoryA.id, transactionCount: 2, totalAmount: 10 },
			]);

			const result = await categoryService.getSummary(USER_ID);

			expect(result.mostUsedCategory).toEqual({
				id: categoryA.id,
				name: categoryA.name,
				transactionCount: 2,
			});
		});

		it('scopes repository calls to the requested user', async () => {
			mockCategoryRepository.findAll.mockResolvedValueOnce([]);
			mockTransactionRepository.groupByCategory.mockResolvedValueOnce([]);

			await categoryService.getSummary(USER_ID);

			expect(mockCategoryRepository.findAll).toHaveBeenCalledWith(USER_ID);
			expect(mockTransactionRepository.groupByCategory).toHaveBeenCalledWith(USER_ID);
		});
	});

	describe('delete', () => {
		const categoryId = 'uuid-1';
		const existing = {
			id: categoryId,
			userId: USER_ID,
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		it('deletes an owned category and returns it', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.delete.mockResolvedValueOnce(existing);

			const result = await categoryService.delete(USER_ID, categoryId);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
			expect(result).toBe(existing);
		});

		it('throws CATEGORY_NOT_FOUND when the id does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce(null);

			const error = await categoryService.delete(USER_ID, categoryId).catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
		});

		it('throws CATEGORY_NOT_FOUND when owned by another user', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce({
				...existing,
				userId: OTHER_USER_ID,
			});

			const error = await categoryService.delete(USER_ID, categoryId).catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
		});
	});
});
