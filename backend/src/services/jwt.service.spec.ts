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
		// biome-ignore lint/style/noNonNullAssertion: exp and iat are supposed to be defined here
		expect(decoded.exp! - decoded.iat!).toBe(60);
	});

	it('produces a token that fails verification with a different secret', () => {
		const token = jwtService.sign({ id: 'uuid-3', email: 'bad@example.com' }, 60);
		expect(() => jwt.verify(token, 'a-different-secret')).toThrow();
	});
});
