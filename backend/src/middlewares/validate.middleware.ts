import { GraphQLError } from 'graphql';
import type { MiddlewareFn } from 'type-graphql';
import type { ZodType } from 'zod';

export function Validate(schema: ZodType, argName: string | 'flat' = 'data'): MiddlewareFn {
	return async ({ args }, next) => {
		const source = argName === 'flat' ? args : args[argName];
		const result = schema.safeParse(source);
		if (!result.success) {
			throw new GraphQLError('Validation failed', {
				extensions: {
					code: 'BAD_USER_INPUT',
					issues: result.error.flatten().fieldErrors,
				},
			});
		}
		if (argName === 'flat') {
			Object.assign(args, result.data);
		} else {
			args[argName] = result.data;
		}
		return next();
	};
}
