import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { UserService } from './user.service.ts';

const USER_ID = 'user-1';

describe('UserService', () => {
	let userService: UserService;
	let mockUserRepository: Mocked<UserRepository>;

	const storedUser = {
		id: USER_ID,
		name: 'Conta teste',
		email: 'conta@teste.com',
		password: 'hashed-password',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	} satisfies UserModel;

	beforeEach(() => {
		mockUserRepository = mockOf<UserRepository>();
		userService = new UserService(mockUserRepository);
	});

	describe('getMe', () => {
		it('returns the user profile without password', async () => {
			mockUserRepository.findById.mockResolvedValueOnce(storedUser);

			const result = await userService.getMe(USER_ID);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(USER_ID);
			expect(result).toEqual({
				id: USER_ID,
				name: 'Conta teste',
				email: 'conta@teste.com',
			});
		});

		it('throws USER_NOT_FOUND when the user does not exist', async () => {
			mockUserRepository.findById.mockResolvedValueOnce(null);

			const error = await userService.getMe(USER_ID).catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('User not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.USER_NOT_FOUND);
		});
	});

	describe('updateProfile', () => {
		it('updates the user name and returns the profile', async () => {
			const updatedUser = { ...storedUser, name: 'Novo nome' };
			mockUserRepository.findById.mockResolvedValueOnce(storedUser);
			mockUserRepository.update.mockResolvedValueOnce(updatedUser);

			const result = await userService.updateProfile(USER_ID, { name: 'Novo nome' });

			expect(mockUserRepository.findById).toHaveBeenCalledWith(USER_ID);
			expect(mockUserRepository.update).toHaveBeenCalledWith(USER_ID, { name: 'Novo nome' });
			expect(result).toEqual({
				id: USER_ID,
				name: 'Novo nome',
				email: 'conta@teste.com',
			});
		});

		it('throws USER_NOT_FOUND when the user does not exist', async () => {
			mockUserRepository.findById.mockResolvedValueOnce(null);

			const error = await userService
				.updateProfile(USER_ID, { name: 'Novo nome' })
				.catch(error => error);

			expect(error).toBeInstanceOf(GraphQLError);
			expect((error as GraphQLError).message).toBe('User not found');
			expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.USER_NOT_FOUND);
			expect(mockUserRepository.update).not.toHaveBeenCalled();
		});
	});
});
