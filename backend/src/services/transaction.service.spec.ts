import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { TransactionWithCategory } from '../db/db-transaction-client.interface.ts';
import type { CreateTransactionInput } from '../dtos/input/transaction.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import { TransactionType } from '../models/transaction-type.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { TransactionService } from './transaction.service.ts';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const CATEGORY_ID = 'category-1';
const TRANSACTION_ID = 'transaction-1';

describe('TransactionService', () => {
	let transactionService: TransactionService;
	let mockTransactionRepository: Mocked<TransactionRepository>;
	let mockCategoryRepository: Mocked<CategoryRepository>;

	beforeEach(() => {
		mockTransactionRepository = mockOf<TransactionRepository>();
		mockCategoryRepository = mockOf<CategoryRepository>();
		transactionService = new TransactionService(mockTransactionRepository, mockCategoryRepository);
	});

	describe('create', () => {
		const input = {
			amount: 89.5,
			type: TransactionType.EXPENSE,
			description: 'Dinner at restaurant',
			date: new Date('2025-11-30T12:00:00.000Z'),
			categoryId: CATEGORY_ID,
		} satisfies CreateTransactionInput;

		const category = {
			id: CATEGORY_ID,
			userId: USER_ID,
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		it('creates a transaction and returns it', async () => {
			const transaction = {
				id: 'transaction-1',
				userId: USER_ID,
				...input,
				category,
			} satisfies TransactionWithCategory;
			mockCategoryRepository.findById.mockResolvedValueOnce(category);
			mockTransactionRepository.create.mockResolvedValueOnce(transaction);

			const result = await transactionService.create(USER_ID, input);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
			expect(mockTransactionRepository.create).toHaveBeenCalledWith({
				...input,
				userId: USER_ID,
			});
			expect(result).toBe(transaction);
		});

		it('throws CATEGORY_NOT_FOUND when the category does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce(null);

			const error = await transactionService.create(USER_ID, input).catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockTransactionRepository.create).not.toHaveBeenCalled();
		});

		it('throws CATEGORY_NOT_FOUND when the category is owned by another user', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce({
				...category,
				userId: OTHER_USER_ID,
			});

			const error = await transactionService.create(USER_ID, input).catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockTransactionRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		const category = {
			id: CATEGORY_ID,
			userId: USER_ID,
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		const existing = {
			id: TRANSACTION_ID,
			userId: USER_ID,
			amount: 89.5,
			type: TransactionType.EXPENSE,
			description: 'Dinner at restaurant',
			date: new Date('2025-11-30T12:00:00.000Z'),
			categoryId: CATEGORY_ID,
			category,
		} satisfies TransactionWithCategory;

		const updateData = {
			amount: 120,
			type: TransactionType.INCOME,
			description: 'Updated description',
			date: new Date('2025-12-01T12:00:00.000Z'),
			categoryId: CATEGORY_ID,
		} satisfies CreateTransactionInput;

		it('updates an owned transaction and returns it', async () => {
			const updated = { ...existing, ...updateData, category } satisfies TransactionWithCategory;
			mockTransactionRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.findById.mockResolvedValueOnce(category);
			mockTransactionRepository.update.mockResolvedValueOnce(updated);

			const result = await transactionService.update(USER_ID, TRANSACTION_ID, updateData);

			expect(mockTransactionRepository.findById).toHaveBeenCalledWith(TRANSACTION_ID);
			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(CATEGORY_ID);
			expect(mockTransactionRepository.update).toHaveBeenCalledWith(TRANSACTION_ID, updateData);
			expect(result).toBe(updated);
		});

		it('throws TRANSACTION_NOT_FOUND when the id does not exist', async () => {
			mockTransactionRepository.findById.mockResolvedValueOnce(null);

			const error = await transactionService
				.update(USER_ID, TRANSACTION_ID, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Transaction not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
			expect(mockTransactionRepository.update).not.toHaveBeenCalled();
		});

		it('throws TRANSACTION_NOT_FOUND when owned by another user', async () => {
			mockTransactionRepository.findById.mockResolvedValueOnce({
				...existing,
				userId: OTHER_USER_ID,
			});

			const error = await transactionService
				.update(USER_ID, TRANSACTION_ID, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Transaction not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
			expect(mockTransactionRepository.update).not.toHaveBeenCalled();
		});

		it('throws CATEGORY_NOT_FOUND when the category does not exist', async () => {
			mockTransactionRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.findById.mockResolvedValueOnce(null);

			const error = await transactionService
				.update(USER_ID, TRANSACTION_ID, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockTransactionRepository.update).not.toHaveBeenCalled();
		});

		it('throws CATEGORY_NOT_FOUND when the category is owned by another user', async () => {
			mockTransactionRepository.findById.mockResolvedValueOnce(existing);
			mockCategoryRepository.findById.mockResolvedValueOnce({
				...category,
				userId: OTHER_USER_ID,
			});

			const error = await transactionService
				.update(USER_ID, TRANSACTION_ID, updateData)
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('Category not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(mockTransactionRepository.update).not.toHaveBeenCalled();
		});
	});

	describe('findPage', () => {
		const category = {
			id: CATEGORY_ID,
			userId: USER_ID,
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		} satisfies CategoryModel;

		it('returns an empty page when no transactions exist', async () => {
			mockTransactionRepository.findMany.mockResolvedValueOnce([]);
			mockTransactionRepository.count.mockResolvedValueOnce(0);

			const result = await transactionService.findPage(USER_ID, { page: 1, pageSize: 10 });

			expect(mockTransactionRepository.findMany).toHaveBeenCalledWith(USER_ID, {
				skip: 0,
				take: 10,
			});
			expect(mockTransactionRepository.count).toHaveBeenCalledWith(USER_ID);
			expect(result).toEqual({
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: 10,
			});
		});

		it('computes skip from page and pageSize', async () => {
			mockTransactionRepository.findMany.mockResolvedValueOnce([]);
			mockTransactionRepository.count.mockResolvedValueOnce(25);

			await transactionService.findPage(USER_ID, { page: 3, pageSize: 10 });

			expect(mockTransactionRepository.findMany).toHaveBeenCalledWith(USER_ID, {
				skip: 20,
				take: 10,
			});
		});

		it('maps repository rows and count into the page shape', async () => {
			const transaction = {
				id: 'transaction-1',
				userId: USER_ID,
				amount: 89.5,
				type: TransactionType.EXPENSE,
				description: 'Dinner at restaurant',
				date: new Date('2025-11-30T12:00:00.000Z'),
				categoryId: CATEGORY_ID,
				category,
			} satisfies TransactionWithCategory;
			mockTransactionRepository.findMany.mockResolvedValueOnce([transaction]);
			mockTransactionRepository.count.mockResolvedValueOnce(1);

			const result = await transactionService.findPage(USER_ID, { page: 1, pageSize: 10 });

			expect(result).toEqual({
				items: [transaction],
				totalCount: 1,
				page: 1,
				pageSize: 10,
			});
		});
	});
});
