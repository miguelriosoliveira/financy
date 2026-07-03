import { Field, Float, ID, ObjectType, registerEnumType } from 'type-graphql';
import { CategoryModel } from './category.model.ts';
import { TransactionType } from './transaction-type.ts';

registerEnumType(TransactionType, {
	name: 'TransactionType',
});

@ObjectType()
export class TransactionModel {
	@Field(() => ID)
	id!: string;

	@Field(() => Float)
	amount!: number;

	@Field(() => String, { nullable: true })
	description?: string | null;

	@Field(() => Date)
	date!: Date;

	@Field(() => TransactionType)
	type!: TransactionType;

	@Field(() => ID)
	categoryId!: string;

	@Field(() => CategoryModel)
	category!: CategoryModel;

	@Field(() => ID)
	userId!: string;
}
