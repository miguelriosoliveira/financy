import { registerSchema } from '@financy/shared';
import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { RegisterInput } from '../dtos/input/auth.input.js';
import { RegisterOutput } from '../dtos/output/auth.output.js';
import { ZodValidation } from '../middlewares/zod-validation.middleware.js';
import type { AuthService } from '../services/auth.service.ts';

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Mutation(() => RegisterOutput)
	@UseMiddleware(ZodValidation(registerSchema))
	async register(
		@Arg('data', () => RegisterInput)
		data: RegisterInput,
	): Promise<RegisterOutput> {
		return this.authService.register(data);
	}
}
