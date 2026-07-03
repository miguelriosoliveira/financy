import type {
	DbTransactionClient,
	TransactionCreateProps,
	TransactionFindManyProps,
	TransactionWithCategory,
} from '../db/db-transaction-client.interface.ts';

export interface TransactionRepository {
	create(props: TransactionCreateProps): Promise<TransactionWithCategory>;
	findMany(userId: string, props: TransactionFindManyProps): Promise<TransactionWithCategory[]>;
	count(userId: string): Promise<number>;
}

export class DbTransactionRepository implements TransactionRepository {
	constructor(private readonly dbTransactionClient: DbTransactionClient) {}

	async create(props: TransactionCreateProps): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.create(props);
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
}
