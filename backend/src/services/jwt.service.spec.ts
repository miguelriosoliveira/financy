import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../env.ts';
import {
	ACCESS_TOKEN_TTL_SECONDS,
	JwtService,
	REFRESH_TOKEN_TTL_SECONDS,
	TOKEN_TYPES,
} from './jwt.service.ts';

describe('JwtService', () => {
	const jwtService = new JwtService();
	const payload = { id: 'uuid-1', email: 'test@example.com' };

	it('signs an access token with the access token type claim', () => {
		const token = jwtService.signAccessToken(payload, 60);
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

		expect(decoded).toMatchObject({ ...payload, tokenType: TOKEN_TYPES.ACCESS });
		expect(decoded.exp).toBeDefined();
	});

	it('signs a refresh token with the refresh token type claim', () => {
		const token = jwtService.signRefreshToken(payload, 60);
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

		expect(decoded).toMatchObject({ ...payload, tokenType: TOKEN_TYPES.REFRESH });
	});

	it('encodes the requested lifetime into the access token expiry', () => {
		const token = jwtService.signAccessToken({ id: 'uuid-2', email: 'exp@example.com' }, 60);
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
		// biome-ignore lint/style/noNonNullAssertion: exp and iat are guaranteed to be defined here
		expect(decoded.exp! - decoded.iat!).toBe(60);
	});

	it('uses the default access and refresh lifetimes', () => {
		const accessToken = jwtService.signAccessToken(payload);
		const refreshToken = jwtService.signRefreshToken(payload);
		const accessDecoded = jwt.verify(accessToken, env.JWT_SECRET) as jwt.JwtPayload;
		const refreshDecoded = jwt.verify(refreshToken, env.JWT_SECRET) as jwt.JwtPayload;

		// biome-ignore lint/style/noNonNullAssertion: exp and iat are guaranteed to be defined here
		expect(accessDecoded.exp! - accessDecoded.iat!).toBe(ACCESS_TOKEN_TTL_SECONDS);
		// biome-ignore lint/style/noNonNullAssertion: exp and iat are guaranteed to be defined here
		expect(refreshDecoded.exp! - refreshDecoded.iat!).toBe(REFRESH_TOKEN_TTL_SECONDS);
	});

	it('produces a token that fails verification with a different secret', () => {
		const token = jwtService.signAccessToken({ id: 'uuid-3', email: 'bad@example.com' }, 60);
		expect(() => jwt.verify(token, 'a-different-secret')).toThrow();
	});

	describe('verifyAccessToken', () => {
		it('returns the payload for a valid access token', () => {
			const token = jwtService.signAccessToken(payload, 60);

			expect(jwtService.verifyAccessToken(token)).toEqual(payload);
		});

		it('returns null for a refresh token', () => {
			const token = jwtService.signRefreshToken(payload, 60);

			expect(jwtService.verifyAccessToken(token)).toBeNull();
		});

		it('returns null for an invalid token', () => {
			expect(jwtService.verifyAccessToken('not-a-valid-token')).toBeNull();
		});

		it('returns null for a token signed with a different secret', () => {
			const token = jwt.sign(
				{ id: 'uuid-5', email: 'other@example.com', tokenType: TOKEN_TYPES.ACCESS },
				'other-secret',
				{ expiresIn: 60 },
			);

			expect(jwtService.verifyAccessToken(token)).toBeNull();
		});
	});

	describe('verifyRefreshToken', () => {
		it('returns the payload and expiry for a valid refresh token', () => {
			const token = jwtService.signRefreshToken(payload, 60);
			const verified = jwtService.verifyRefreshToken(token);

			expect(verified).toMatchObject(payload);
			expect(verified?.exp).toEqual(expect.any(Number));
		});

		it('returns null for an access token', () => {
			const token = jwtService.signAccessToken(payload, 60);

			expect(jwtService.verifyRefreshToken(token)).toBeNull();
		});

		it('returns null for an invalid token', () => {
			expect(jwtService.verifyRefreshToken('not-a-valid-token')).toBeNull();
		});
	});
});
