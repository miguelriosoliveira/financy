import jwt from 'jsonwebtoken';
import { env } from '../env.ts';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export const TOKEN_TYPES = {
	ACCESS: 'access',
	REFRESH: 'refresh',
} as const;

export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

export type JwtPayload = {
	id: string;
	email: string;
};

type SignedJwtPayload = JwtPayload & {
	tokenType: TokenType;
};

export type VerifiedRefreshToken = JwtPayload & {
	exp: number;
};

export class JwtService {
	signAccessToken(payload: JwtPayload, expiresIn = ACCESS_TOKEN_TTL_SECONDS) {
		return this.sign({ ...payload, tokenType: TOKEN_TYPES.ACCESS }, expiresIn);
	}

	signRefreshToken(payload: JwtPayload, expiresIn = REFRESH_TOKEN_TTL_SECONDS) {
		return this.sign({ ...payload, tokenType: TOKEN_TYPES.REFRESH }, expiresIn);
	}

	verifyAccessToken(token: string): JwtPayload | null {
		const decoded = this.decode(token);
		if (!decoded || decoded.tokenType !== TOKEN_TYPES.ACCESS) {
			return null;
		}
		return { id: decoded.id, email: decoded.email };
	}

	verifyRefreshToken(token: string): VerifiedRefreshToken | null {
		const decoded = this.decode(token);
		if (!decoded || decoded.tokenType !== TOKEN_TYPES.REFRESH || decoded.exp === undefined) {
			return null;
		}
		return { id: decoded.id, email: decoded.email, exp: decoded.exp };
	}

	private sign(payload: SignedJwtPayload, expiresIn: number) {
		return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
	}

	private decode(token: string): (SignedJwtPayload & { exp?: number }) | null {
		try {
			const { id, email, tokenType, exp } = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
				SignedJwtPayload;
			if (typeof id !== 'string' || typeof email !== 'string') {
				return null;
			}
			return { id, email, tokenType, exp };
		} catch {
			return null;
		}
	}
}
