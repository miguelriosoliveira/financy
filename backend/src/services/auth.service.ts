import type { LoginInput, RegisterInput } from '../dtos/input/auth.input.ts';
import type { LoginOutput, RegisterOutput } from '../dtos/output/auth.output.ts';
import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user.repository.ts';
import type { HashService } from './hash.service.ts';
import type { JwtService } from './jwt.service.ts';

export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashService,
		private readonly jwtService: JwtService,
	) {}

	private generateTokens(user: UserModel) {
		const { id, email } = user;
		const token = this.jwtService.sign({ id, email }, 60 * 15); // 15min in seconds
		const refreshToken = this.jwtService.sign({ id, email }, 60 * 60 * 24); // 24h in seconds
		return { token, refreshToken, user };
	}

	async register({ name, email, password: rawPassword }: RegisterInput): Promise<RegisterOutput> {
		const userFound = await this.userRepository.findByEmail(email);
		if (userFound) {
			throw new Error('User already registered');
		}
		const password = await this.hashService.hash(rawPassword);
		await this.userRepository.create({ name, email, password });
		return { success: true };
	}

	async login({ email, password: rawPassword }: LoginInput): Promise<LoginOutput> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new Error('Invalid credentials');
		}
		const isPasswordValid = await this.hashService.compare(rawPassword, user.password);
		if (!isPasswordValid) {
			throw new Error('Invalid credentials');
		}
		return this.generateTokens(user);
	}
}
