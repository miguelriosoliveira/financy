import { GraphQLError } from 'graphql';
import type { MiddlewareFn } from 'type-graphql';
import type { ZodType } from 'zod';

export function ZodValidation(schema: ZodType, argName = 'data'): MiddlewareFn {
	return async ({ args }, next) => {
		const result = schema.safeParse(args[argName]);
		if (!result.success) {
			throw new GraphQLError('Validation failed', {
				extensions: {
					code: 'BAD_USER_INPUT',
					issues: result.error.flatten().fieldErrors,
				},
			});
		}
		args[argName] = result.data;
		return next();
	};
}
