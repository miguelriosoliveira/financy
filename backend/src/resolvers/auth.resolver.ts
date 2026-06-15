import { loginSchema, registerSchema } from '@financy/shared';
import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { LoginInput, RegisterInput } from '../dtos/input/auth.input.js';
import { LoginOutput, RegisterOutput } from '../dtos/output/auth.output.js';
import { Validate } from '../middlewares/validate.middleware.ts';
import type { AuthService } from '../services/auth.service.ts';

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Mutation(() => RegisterOutput)
	@UseMiddleware(Validate(registerSchema))
	async register(
		@Arg('data', () => RegisterInput)
		data: RegisterInput,
	): Promise<RegisterOutput> {
		return this.authService.register(data);
	}

	@Mutation(() => LoginOutput)
	@UseMiddleware(Validate(loginSchema))
	async login(
		@Arg('data', () => LoginInput)
		data: LoginInput,
	): Promise<LoginOutput> {
		return this.authService.login(data);
	}
}
