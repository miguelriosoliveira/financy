import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class CategoryUsageSummary {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;

	@Field(() => Int)
	transactionCount!: number;
}

@ObjectType()
export class CategoriesSummary {
	@Field(() => Int)
	transactionCount!: number;

	@Field(() => CategoryUsageSummary, { nullable: true })
	mostUsedCategory?: CategoryUsageSummary | null;
}
