import type { RegisterInput } from '../dtos/input/auth.input.ts';
import type { RegisterOutput } from '../dtos/output/auth.output.ts';
import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user-repository.ts';
import { signJwt } from '../utils/jwt.ts';

export class AuthService {
	constructor(private readonly userRepository: UserRepository) {}

	private generateTokens(user: UserModel) {
		const { id, email } = user;
		const token = signJwt({ id, email }, 60 * 15); // 15min in seconds
		const refreshToken = signJwt({ id, email }, 60 * 60 * 24); // 24h in seconds
		return { token, refreshToken, user };
	}

	async register({ name, email, password }: RegisterInput): Promise<RegisterOutput> {
		const userFound = await this.userRepository.findByEmail(email);
		if (userFound) {
			throw new Error('User already registered');
		}
		const user = await this.userRepository.create({ name, email, password });
		return this.generateTokens(user);
	}
}
