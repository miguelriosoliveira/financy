import type { RegisterInput } from '../dtos/input/auth.input.ts';
import type { RegisterOutput } from '../dtos/output/auth.output.ts';
import type { UserModel } from '../models/user.model.ts';
import { signJwt } from '../utils/jwt.ts';

export class AuthService {
	private generateTokens(user: UserModel) {
		const { id, email } = user;
		const token = signJwt({ id, email }, 60 * 15); // 15min in seconds
		const refreshToken = signJwt({ id, email }, 60 * 60 * 24); // 24h in seconds
		return { token, refreshToken, user };
	}

	async register(data: RegisterInput): Promise<RegisterOutput> {
		const userFound = await userRepository.findBy({ email: data.email });
		if (userFound) {
			throw new Error('User already registered!');
		}
		const user = userRepository.create({
			name: data.name,
			email: data.email,
			password: data.password,
		});
		return this.generateTokens(user);
	}
}
