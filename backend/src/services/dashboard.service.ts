import type { DashboardSummary } from '../dtos/output/dashboard-summary.output.ts';
import { TransactionType } from '../models/transaction-type.ts';
import type { TransactionRepository } from '../repositories/transaction.repository.ts';
import { getCurrentMonthRange } from '../utils/date-range.ts';

export class DashboardService {
	constructor(private readonly transactionRepository: TransactionRepository) {}

	async getSummary(userId: string): Promise<DashboardSummary> {
		const monthRange = getCurrentMonthRange();

		const [monthlyIncome, monthlyExpenses, totalIncome, totalExpenses] = await Promise.all([
			this.transactionRepository.sumByType(userId, TransactionType.INCOME, monthRange),
			this.transactionRepository.sumByType(userId, TransactionType.EXPENSE, monthRange),
			this.transactionRepository.sumByType(userId, TransactionType.INCOME),
			this.transactionRepository.sumByType(userId, TransactionType.EXPENSE),
		]);

		return {
			totalBalance: totalIncome - totalExpenses,
			monthlyIncome,
			monthlyExpenses,
		};
	}
}
