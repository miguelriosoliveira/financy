import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import type { UpdateProfileInput } from '../dtos/input/profile.input.ts';
import type { UserProfileOutput } from '../dtos/output/profile.output.ts';
import { toUserProfileOutput } from '../mappers/user.mapper.ts';
import type { UserRepository } from '../repositories/user.repository.ts';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async getMe(userId: string): Promise<UserProfileOutput> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new GraphQLError('User not found', {
				extensions: { code: ERROR_CODES.USER_NOT_FOUND },
			});
		}

		return toUserProfileOutput(user);
	}

	async updateProfile(userId: string, { name }: UpdateProfileInput): Promise<UserProfileOutput> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new GraphQLError('User not found', {
				extensions: { code: ERROR_CODES.USER_NOT_FOUND },
			});
		}

		const updated = await this.userRepository.update(userId, { name });
		return toUserProfileOutput(updated);
	}
}
