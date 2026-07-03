import type { CategoryModel } from '../models/category.model.ts';
import type { TransactionModel } from '../models/transaction.model.ts';

export type TransactionCreateProps = Pick<
	TransactionModel,
	'amount' | 'description' | 'date' | 'type' | 'categoryId' | 'userId'
>;

export type TransactionWithCategory = TransactionModel & {
	category: CategoryModel;
};

export type TransactionFindManyProps = {
	skip: number;
	take: number;
};

export interface DbTransactionClient {
	transaction: {
		create(props: TransactionCreateProps): Promise<TransactionWithCategory>;
		findMany(userId: string, props: TransactionFindManyProps): Promise<TransactionWithCategory[]>;
		count(userId: string): Promise<number>;
	};
}
