import { Field, Float, InputType } from 'type-graphql';
import { TransactionType } from '../../models/transaction-type.ts';

@InputType()
export class CreateTransactionInput {
	@Field(() => Float)
	amount!: number;

	@Field(() => TransactionType)
	type!: TransactionType;

	@Field(() => String, { nullable: true })
	description?: string;

	@Field(() => Date)
	date!: Date;

	@Field(() => String)
	categoryId!: string;
}
