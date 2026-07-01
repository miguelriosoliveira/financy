import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { CreateTransactionInput } from '../dtos/input/transaction.input.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { TransactionModel } from '../models/transaction.model.ts';
import { TransactionType } from '../models/transaction-type.ts';
import type { CategoryRepository } from '../repositories/category.repository.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { TransactionService } from './transaction.service.ts';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const CATEGORY_ID = 'category-1';

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
			} satisfies TransactionModel;
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
});
