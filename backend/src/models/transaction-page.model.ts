import { Field, Int, ObjectType } from 'type-graphql';
import { TransactionModel } from './transaction.model.ts';

@ObjectType()
export class TransactionPage {
	@Field(() => [TransactionModel])
	items!: TransactionModel[];

	@Field(() => Int)
	totalCount!: number;

	@Field(() => Int)
	page!: number;

	@Field(() => Int)
	pageSize!: number;
}
