import type {
	DbTransactionClient,
	TransactionCreateProps,
	TransactionFindManyProps,
	TransactionUpdateProps,
	TransactionWithCategory,
} from '../db/db-transaction-client.interface.ts';

export interface TransactionRepository {
	create(props: TransactionCreateProps): Promise<TransactionWithCategory>;
	findById(id: string): Promise<TransactionWithCategory | null>;
	findMany(userId: string, props: TransactionFindManyProps): Promise<TransactionWithCategory[]>;
	count(userId: string): Promise<number>;
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

	async update(id: string, props: TransactionUpdateProps): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.update(id, props);
	}

	async delete(id: string): Promise<TransactionWithCategory> {
		return this.dbTransactionClient.transaction.delete(id);
	}
}
