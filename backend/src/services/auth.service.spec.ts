import { beforeEach, describe, expect, it, type Mocked } from 'vitest';
import type { UserRepository } from '../repositories/user.repository.ts';
import { mockOf } from '../tests/helpers/mocks.ts';
import { AuthService } from './auth.service.ts';
import type { HashService } from './hash.service.ts';
import type { JwtService } from './jwt.service.ts';

describe('AuthService', () => {
	let authService: AuthService;
	let mockUserRepository: Mocked<UserRepository>;
	let mockHashService: Mocked<HashService>;
	let mockJwtService: Mocked<JwtService>;

	beforeEach(() => {
		mockUserRepository = mockOf<UserRepository>();
		mockHashService = mockOf<HashService>();
		mockJwtService = mockOf<JwtService>();
		mockJwtService.sign.mockReturnValue('mocked-jwt-token');
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
			expect(mockJwtService.sign).not.toHaveBeenCalled();
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
			expect(mockJwtService.sign).not.toHaveBeenCalled();
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
			expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
			expect(result).toEqual({
				token: 'mocked-jwt-token',
				refreshToken: 'mocked-jwt-token',
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
			expect(mockJwtService.sign).not.toHaveBeenCalled();
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
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});
	});
});
