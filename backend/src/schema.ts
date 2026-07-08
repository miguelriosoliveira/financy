import { type BuildSchemaOptions, buildSchema } from 'type-graphql';
import { authChecker } from './auth/auth-checker.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { CategoryResolver } from './resolvers/category.resolver.ts';
import { DashboardResolver } from './resolvers/dashboard.resolver.ts';
import { HealthResolver } from './resolvers/health.resolver.ts';
import { TransactionResolver } from './resolvers/transaction.resolver.ts';
import { UserResolver } from './resolvers/user.resolver.ts';

export async function buildAppSchema(
	options: Omit<BuildSchemaOptions, 'resolvers' | 'validate' | 'authChecker'> = {},
) {
	return buildSchema({
		resolvers: [
			HealthResolver,
			AuthResolver,
			UserResolver,
			CategoryResolver,
			TransactionResolver,
			DashboardResolver,
		],
		validate: false,
		authChecker,
		...options,
	});
}
