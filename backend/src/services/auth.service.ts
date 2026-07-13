import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { LoginInput, RefreshTokenInput, RegisterInput } from '../dtos/input/auth.input.ts';
import type {
	LoginOutput,
	RefreshTokenOutput,
	RegisterOutput,
} from '../dtos/output/auth.output.ts';
import { toUserProfileOutput } from '../mappers/user.mapper.ts';
import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user.repository.ts';
import type { HashService } from './hash.service.ts';
import { ACCESS_TOKEN_TTL_SECONDS, type JwtService } from './jwt.service.ts';

export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashService,
		private readonly jwtService: JwtService,
	) {}

	private generateTokens(user: UserModel): LoginOutput {
		const { id, email } = user;
		const token = this.jwtService.signAccessToken({ id, email }, ACCESS_TOKEN_TTL_SECONDS);
		const refreshToken = this.jwtService.signRefreshToken({ id, email });
		return { token, refreshToken, user: toUserProfileOutput(user) };
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

	async refreshToken({ refreshToken }: RefreshTokenInput): Promise<RefreshTokenOutput> {
		const payload = this.jwtService.verifyRefreshToken(refreshToken);
		if (!payload) {
			throw new GraphQLError('Invalid refresh token', {
				extensions: { code: ERROR_CODES.UNAUTHENTICATED },
			});
		}

		const remainingTtl = payload.exp - Math.floor(Date.now() / 1000);
		if (remainingTtl <= 0) {
			throw new GraphQLError('Refresh token expired', {
				extensions: { code: ERROR_CODES.UNAUTHENTICATED },
			});
		}

		const user = await this.userRepository.findById(payload.id);
		if (!user || user.email !== payload.email) {
			throw new GraphQLError('Invalid refresh token', {
				extensions: { code: ERROR_CODES.UNAUTHENTICATED },
			});
		}

		return {
			token: this.jwtService.signAccessToken({ id: user.id, email: user.email }),
			refreshToken: this.jwtService.signRefreshToken(
				{ id: user.id, email: user.email },
				remainingTtl,
			),
		};
	}
}
