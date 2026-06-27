import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../env.ts';
import { JwtService } from './jwt.service.ts';

describe('JwtService', () => {
	const jwtService = new JwtService();

	it('signs a token that can be verified with the configured secret', () => {
		const payload = { id: 'uuid-1', email: 'test@example.com' };

		const token = jwtService.sign(payload, 60);
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

		expect(decoded).toMatchObject(payload);
		expect(decoded.exp).toBeDefined();
	});

	it('encodes the requested lifetime into the token expiry', () => {
		const token = jwtService.sign({ id: 'uuid-2', email: 'exp@example.com' }, 60);
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
		// biome-ignore lint/style/noNonNullAssertion: exp and iat are guaranteed to be defined here
		expect(decoded.exp! - decoded.iat!).toBe(60);
	});

	it('produces a token that fails verification with a different secret', () => {
		const token = jwtService.sign({ id: 'uuid-3', email: 'bad@example.com' }, 60);
		expect(() => jwt.verify(token, 'a-different-secret')).toThrow();
	});

	describe('verify', () => {
		it('returns the payload for a valid token', () => {
			const payload = { id: 'uuid-4', email: 'verify@example.com' };
			const token = jwtService.sign(payload, 60);

			expect(jwtService.verify(token)).toEqual(payload);
		});

		it('returns null for an invalid token', () => {
			expect(jwtService.verify('not-a-valid-token')).toBeNull();
		});

		it('returns null for a token signed with a different secret', () => {
			const token = jwt.sign({ id: 'uuid-5', email: 'other@example.com' }, 'other-secret', {
				expiresIn: 60,
			});

			expect(jwtService.verify(token)).toBeNull();
		});
	});
});
