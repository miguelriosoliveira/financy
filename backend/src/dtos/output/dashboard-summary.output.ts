import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class DashboardSummary {
	@Field(() => Float)
	totalBalance!: number;

	@Field(() => Float)
	monthlyIncome!: number;

	@Field(() => Float)
	monthlyExpenses!: number;
}
