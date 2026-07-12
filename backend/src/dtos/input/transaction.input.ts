import { Field, Float, InputType, Int } from 'type-graphql';
import { TransactionType } from '../../models/transaction-type.ts';

@InputType()
export class TransactionPeriodInput {
	@Field(() => Int)
	year!: number;

	@Field(() => Int)
	month!: number;
}

@InputType()
export class ListTransactionsFiltersInput {
	@Field(() => String, { nullable: true })
	search?: string;

	@Field(() => TransactionType, { nullable: true })
	type?: TransactionType;

	@Field(() => String, { nullable: true })
	categoryId?: string;

	@Field(() => TransactionPeriodInput, { nullable: true })
	period?: TransactionPeriodInput;
}

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

@InputType()
export class UpdateTransactionInput {
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
