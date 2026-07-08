import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import { TransactionType } from '../models/transaction-type.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { DashboardService } from './dashboard.service.ts';

const USER_ID = 'user-1';

describe('DashboardService', () => {
	let dashboardService: DashboardService;
	let mockTransactionRepository: Mocked<TransactionRepository>;

	beforeEach(() => {
		mockTransactionRepository = mockOf<TransactionRepository>();
		dashboardService = new DashboardService(mockTransactionRepository);
	});

	describe('getSummary', () => {
		it('returns balance and current-month income/expenses', async () => {
			mockTransactionRepository.sumByType
				.mockResolvedValueOnce(500)
				.mockResolvedValueOnce(200)
				.mockResolvedValueOnce(1500)
				.mockResolvedValueOnce(500);

			const result = await dashboardService.getSummary(USER_ID);

			expect(mockTransactionRepository.sumByType).toHaveBeenCalledTimes(4);
			expect(mockTransactionRepository.sumByType).toHaveBeenNthCalledWith(
				1,
				USER_ID,
				TransactionType.INCOME,
				expect.objectContaining({
					start: expect.any(Date),
					end: expect.any(Date),
				}),
			);
			expect(mockTransactionRepository.sumByType).toHaveBeenNthCalledWith(
				2,
				USER_ID,
				TransactionType.EXPENSE,
				expect.objectContaining({
					start: expect.any(Date),
					end: expect.any(Date),
				}),
			);
			expect(mockTransactionRepository.sumByType).toHaveBeenNthCalledWith(
				3,
				USER_ID,
				TransactionType.INCOME,
			);
			expect(mockTransactionRepository.sumByType).toHaveBeenNthCalledWith(
				4,
				USER_ID,
				TransactionType.EXPENSE,
			);
			expect(result).toEqual({
				totalBalance: 1000,
				monthlyIncome: 500,
				monthlyExpenses: 200,
			});
		});
	});
});
