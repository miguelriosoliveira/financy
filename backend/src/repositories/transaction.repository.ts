import type {
	CategoryAggregation,
	CategoryAggregationFilters,
	DbTransactionClient,
	TransactionCreateProps,
	TransactionFindManyProps,
	TransactionUpdateProps,
	TransactionWithCategory,
} from '../db/db-transaction-client.interface.ts';
import type { TransactionType } from '../models/transaction-type.ts';
import type { DateRange } from '../utils/date-range.ts';

export interface TransactionRepository {
	create(props: TransactionCreateProps): Promise<TransactionWithCategory>;
	findById(id: string): Promise<TransactionWithCategory | null>;
	findMany(userId: string, props: TransactionFindManyProps): Promise<TransactionWithCategory[]>;
	count(userId: string): Promise<number>;
	sumByType(userId: string, type: TransactionType, dateRange?: DateRange): Promise<number>;
	groupByCategory(
		userId: string,
		filters?: CategoryAggregationFilters,
	): Promise<CategoryAggregation[]>;
	update(id: string, props: TransactionUpdateProps): Promise<TransactionWithCategory>;
	delete(id: string): Promise<TransactionWithCategory>;
}

export class DbTransactionRepository implements TransactionRepository {
	constructor(private readonly dbTransactionClient: DbTransactionClient) {}

	async create(props: TransactionCreateProps): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.create(props);
	}

	async findById(id: string): Promise<TransactionWithCategory | null> {
		return this.dbTransactionClient.transaction.findById(id);
	}

	async findMany(
		userId: string,
		props: TransactionFindManyProps,
	): Promise<TransactionWithCategory[]> {
		return this.dbTransactionClient.transaction.findMany(userId, props);
	}

	async count(userId: string): Promise<number> {
		return this.dbTransactionClient.transaction.count(userId);
	}

	async sumByType(userId: string, type: TransactionType, dateRange?: DateRange): Promise<number> {
		return this.dbTransactionClient.transaction.sumByType(userId, type, dateRange);
	}

	async groupByCategory(
		userId: string,
		filters?: CategoryAggregationFilters,
	): Promise<CategoryAggregation[]> {
		return this.dbTransactionClient.transaction.groupByCategory(userId, filters);
	}

	async update(id: string, props: TransactionUpdateProps): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.update(id, props);
	}

	async delete(id: string): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.delete(id);
	}
}
