import { type BuildSchemaOptions, buildSchema } from 'type-graphql';
import { authChecker } from './auth/auth-checker.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { CategoryResolver } from './resolvers/category.resolver.ts';
import { HealthResolver } from './resolvers/health.resolver.ts';

const resolvers = [HealthResolver, AuthResolver, CategoryResolver] as const;

export async function buildAppSchema(
	options: Omit<BuildSchemaOptions, 'resolvers' | 'validate' | 'authChecker'> = {},
) {
	return buildSchema({
		resolvers: [...resolvers],
		validate: false,
		authChecker,
		...options,
	});
}
