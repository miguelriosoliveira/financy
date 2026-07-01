import type { TransactionModel } from '../models/transaction.model.ts';

export type TransactionCreateProps = Pick<
	TransactionModel,
	'amount' | 'description' | 'date' | 'type' | 'categoryId' | 'userId'
>;

export interface DbTransactionClient {
	transaction: {
		create(props: TransactionCreateProps): Promise<TransactionModel>;
	};
}
