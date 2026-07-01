import type {
	DbTransactionClient,
	TransactionCreateProps,
} from '../db/db-transaction-client.interface.ts';
import type { TransactionModel } from '../models/transaction.model.ts';

export interface TransactionRepository {
	create(props: TransactionCreateProps): Promise<TransactionModel>;
}

export class DbTransactionRepository implements TransactionRepository {
	constructor(private readonly dbTransactionClient: DbTransactionClient) {}

	async create(props: TransactionCreateProps): Promise<TransactionModel> {
		return this.dbTransactionClient.transaction.create(props);
	}
}
