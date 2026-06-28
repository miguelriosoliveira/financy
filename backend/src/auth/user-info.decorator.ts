import { createParameterDecorator, type ParameterDecorator } from 'type-graphql';
import type { GraphQLContext } from '../context.ts';
import type { JwtPayload } from '../services/jwt.service.ts';

// Injects the JWT payload (not the domain User model).
// Safe cast: @Authorized() guarantees a non-null user before resolvers run.
export function UserInfo(): ParameterDecorator {
	return createParameterDecorator<GraphQLContext>(({ context }) => context.user as JwtPayload);
}
