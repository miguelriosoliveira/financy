import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class TransactionPeriodOutput {
	@Field(() => Int)
	year!: number;

	@Field(() => Int)
	month!: number;
}
