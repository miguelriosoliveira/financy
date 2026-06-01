import { Arg, Mutation, Resolver } from 'type-graphql';
import { RegisterInput } from '../dtos/input/auth.input.js';
import type { RegisterOutput } from '../dtos/output/auth.output.ts';
import type { AuthService } from '../services/auth.service.ts';

@Resolver()
export class AuthResolver {
	private readonly authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	@Mutation()
	async register(
		@Arg('data', () => RegisterInput)
		data: RegisterInput,
	): Promise<RegisterOutput> {
		return this.authService.register(data);
	}
}
