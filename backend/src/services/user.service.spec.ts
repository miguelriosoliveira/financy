import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user-repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { UserService } from './user.service.ts';

describe('UserService', () => {
	let userService: UserService;
	let mockUserRepository: Mocked<UserRepository>;

	beforeEach(() => {
		mockUserRepository = mockOf<UserRepository>();
		userService = new UserService(mockUserRepository);
	});

	describe('findUser', () => {
		it('returns the user resolved by the repository', async () => {
			const user = {
				id: 'uuid-1',
				name: 'Test User',
				email: 'test@example.com',
				password: 'hashed',
				createdAt: new Date(),
				updatedAt: new Date(),
			} satisfies UserModel;
			mockUserRepository.findById.mockResolvedValueOnce(user);

			const result = await userService.findUser('uuid-1');

			expect(mockUserRepository.findById).toHaveBeenCalledWith('uuid-1');
			expect(result).toBe(user);
		});

		it('propagates the error when the repository throws', async () => {
			mockUserRepository.findById.mockRejectedValueOnce(new Error('User not found'));
			await expect(userService.findUser('missing')).rejects.toThrow('User not found');
		});
	});
});
