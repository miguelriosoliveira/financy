import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { HashService } from './hash.service.ts';

describe('HashService', () => {
	const hashService = new HashService();

	describe('hash', () => {
		it('produces a bcrypt hash that does not equal the plain text', async () => {
			const hashed = await hashService.hash('password123');
			expect(hashed).not.toBe('password123');
			expect(hashed).toMatch(/^\$2[aby]\$/);
		});

		it('produces a hash that can be verified with the original password', async () => {
			const hashed = await hashService.hash('password123');
			await expect(bcrypt.compare('password123', hashed)).resolves.toBe(true);
			await expect(bcrypt.compare('wrong-password', hashed)).resolves.toBe(false);
		});
	});

	describe('compare', () => {
		it('returns true when the password matches the hash', async () => {
			const hashed = await hashService.hash('password123');
			await expect(hashService.compare('password123', hashed)).resolves.toBe(true);
		});

		it('returns false when the password does not match the hash', async () => {
			const hashed = await hashService.hash('password123');
			await expect(hashService.compare('wrong-password', hashed)).resolves.toBe(false);
		});
	});
});
