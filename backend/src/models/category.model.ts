import { Field, Float, ID, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class CategoryModel {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;

	@Field(() => String, { nullable: true })
	description?: string | null;

	@Field(() => String)
	icon!: string;

	@Field(() => String)
	color!: string;

	@Field(() => ID)
	userId!: string;

	@Field(() => Int, { nullable: true })
	transactionCount?: number | null;

	@Field(() => Float, { nullable: true })
	totalAmount?: number | null;
}
