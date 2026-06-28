import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { AuthChecker } from 'type-graphql';
import type { GraphQLContext } from '../context.ts';

export const authChecker: AuthChecker<GraphQLContext> = ({ context }) => {
	if (!context.user) {
		throw new GraphQLError('Unauthorized', {
			extensions: { code: ERROR_CODES.UNAUTHENTICATED },
		});
	}
	return true;
};
