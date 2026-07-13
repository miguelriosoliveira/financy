import { ERROR_CODES } from '@financy/shared';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { UserRepository } from '../repositories/user.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { AuthService } from './auth.service.ts';
import type { HashService } from './hash.service.ts';
import { ACCESS_TOKEN_TTL_SECONDS, type JwtService } from './jwt.service.ts';

describe('AuthService', () => {
	let authService: AuthService;
	let mockUserRepository: Mocked<UserRepository>;
	let mockHashService: Mocked<HashService>;
	let mockJwtService: Mocked<JwtService>;

	beforeEach(() => {
		mockUserRepository = mockOf<UserRepository>();
		mockHashService = mockOf<HashService>();
		mockJwtService = mockOf<JwtService>();
		mockJwtService.signAccessToken.mockReturnValue('mocked-access-token');
		mockJwtService.signRefreshToken.mockReturnValue('mocked-refresh-token');
		authService = new AuthService(mockUserRepository, mockHashService, mockJwtService);
	});

	describe('register', () => {
		it('should register a new user successfully and return success', async () => {
			// Arrange
			const input = { name: 'Test User', email: 'test@example.com', password: 'password123' };
			const hashedPassword = 'hashed-password';
			const createdUser = {
				id: 'uuid-1234',
				name: input.name,
				email: input.email,
				password: hashedPassword,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockUserRepository.findByEmail.mockResolvedValueOnce(null); // User does not exist
			mockHashService.hash.mockResolvedValueOnce(hashedPassword);
			mockUserRepository.create.mockResolvedValueOnce(createdUser);

			// Act
			const result = await authService.register(input);

			// Assert
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
			expect(mockHashService.hash).toHaveBeenCalledWith(input.password);
			expect(mockUserRepository.create).toHaveBeenCalledWith({
				name: input.name,
				email: input.email,
				password: hashedPassword,
			});
			expect(mockJwtService.signAccessToken).not.toHaveBeenCalled();
			expect(mockJwtService.signRefreshToken).not.toHaveBeenCalled();
			expect(result).toEqual({ success: true });
		});

		it('should throw an error if the user already exists', async () => {
			// Arrange
			const input = { name: 'Existing User', email: 'test@example.com', password: 'password123' };
			mockUserRepository.findByEmail.mockResolvedValueOnce({
				id: 'uuid-1',
				...input,
				createdAt: new Date(),
				updatedAt: new Date(),
			}); // User exists

			// Act & Assert
			await expect(authService.register(input)).rejects.toThrow('User already registered');
			expect(mockHashService.hash).not.toHaveBeenCalled();
			expect(mockJwtService.signAccessToken).not.toHaveBeenCalled();
			expect(mockJwtService.signRefreshToken).not.toHaveBeenCalled();
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('login', () => {
		it('should log in successfully and return tokens', async () => {
			// Arrange
			const input = { email: 'test@example.com', password: 'password123' };
			const user = {
				id: 'uuid-1234',
				name: 'Test User',
				email: input.email,
				password: 'hashed-password',
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockUserRepository.findByEmail.mockResolvedValueOnce(user);
			mockHashService.compare.mockResolvedValueOnce(true);

			// Act
			const result = await authService.login(input);

			// Assert
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
			expect(mockHashService.compare).toHaveBeenCalledWith(input.password, user.password);
			expect(mockJwtService.signAccessToken).toHaveBeenCalledWith(
				{ id: user.id, email: user.email },
				ACCESS_TOKEN_TTL_SECONDS,
			);
			expect(mockJwtService.signRefreshToken).toHaveBeenCalledWith({
				id: user.id,
				email: user.email,
			});
			expect(result).toEqual({
				token: 'mocked-access-token',
				refreshToken: 'mocked-refresh-token',
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
			});
		});

		it('should throw an error if the user is not found', async () => {
			// Arrange
			const input = { email: 'missing@example.com', password: 'password123' };
			mockUserRepository.findByEmail.mockResolvedValueOnce(null);

			// Act & Assert
			await expect(authService.login(input)).rejects.toThrow('Invalid credentials');
			expect(mockHashService.compare).not.toHaveBeenCalled();
			expect(mockJwtService.signAccessToken).not.toHaveBeenCalled();
			expect(mockJwtService.signRefreshToken).not.toHaveBeenCalled();
		});

		it('should throw an error if the password is invalid', async () => {
			// Arrange
			const input = { email: 'test@example.com', password: 'wrong-password' };
			const user = {
				id: 'uuid-1234',
				name: 'Test User',
				email: input.email,
				password: 'hashed-password',
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			mockUserRepository.findByEmail.mockResolvedValueOnce(user);
			mockHashService.compare.mockResolvedValueOnce(false);

			// Act & Assert
			await expect(authService.login(input)).rejects.toThrow('Invalid credentials');
			expect(mockHashService.compare).toHaveBeenCalledWith(input.password, user.password);
			expect(mockJwtService.signAccessToken).not.toHaveBeenCalled();
			expect(mockJwtService.signRefreshToken).not.toHaveBeenCalled();
		});
	});

	describe('refreshToken', () => {
		const user = {
			id: 'uuid-1234',
			name: 'Test User',
			email: 'test@example.com',
			password: 'hashed-password',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		it('rotates tokens while preserving the remaining refresh lifetime', async () => {
			const remainingTtl = 3600;
			mockJwtService.verifyRefreshToken.mockReturnValueOnce({
				id: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) + remainingTtl,
			});
			mockUserRepository.findById.mockResolvedValueOnce(user);

			const result = await authService.refreshToken({ refreshToken: 'valid-refresh-token' });

			expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
			expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
			expect(mockJwtService.signAccessToken).toHaveBeenCalledWith({
				id: user.id,
				email: user.email,
			});
			expect(mockJwtService.signRefreshToken).toHaveBeenCalledWith(
				{ id: user.id, email: user.email },
				expect.any(Number),
			);
			const [, refreshTtl] = mockJwtService.signRefreshToken.mock.calls[0] ?? [];
			expect(refreshTtl).toBeGreaterThan(remainingTtl - 2);
			expect(refreshTtl).toBeLessThanOrEqual(remainingTtl);
			expect(result).toEqual({
				token: 'mocked-access-token',
				refreshToken: 'mocked-refresh-token',
			});
		});

		it('rejects an invalid refresh token', async () => {
			mockJwtService.verifyRefreshToken.mockReturnValueOnce(null);

			await expect(authService.refreshToken({ refreshToken: 'bad-token' })).rejects.toSatisfy(
				(error: unknown) => {
					expect(error).toBeInstanceOf(GraphQLError);
					expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
					return true;
				},
			);
		});

		it('rejects an expired refresh token', async () => {
			mockJwtService.verifyRefreshToken.mockReturnValueOnce({
				id: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) - 1,
			});

			await expect(authService.refreshToken({ refreshToken: 'expired-token' })).rejects.toSatisfy(
				(error: unknown) => {
					expect(error).toBeInstanceOf(GraphQLError);
					expect((error as GraphQLError).message).toBe('Refresh token expired');
					return true;
				},
			);
		});

		it('rejects refresh when the user no longer exists', async () => {
			mockJwtService.verifyRefreshToken.mockReturnValueOnce({
				id: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) + 3600,
			});
			mockUserRepository.findById.mockResolvedValueOnce(null);

			await expect(
				authService.refreshToken({ refreshToken: 'valid-refresh-token' }),
			).rejects.toSatisfy((error: unknown) => {
				expect(error).toBeInstanceOf(GraphQLError);
				expect((error as GraphQLError).extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
				return true;
			});
		});
	});
});
