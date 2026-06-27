import jwt from 'jsonwebtoken';
import { env } from '../env.ts';

export type JwtPayload = {
	id: string;
	email: string;
};

export class JwtService {
	sign(payload: JwtPayload, expiresIn = 60) {
		return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
	}

	verify(token: string): JwtPayload | null {
		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
			if (typeof decoded.id !== 'string' || typeof decoded.email !== 'string') {
				return null;
			}
			return { id: decoded.id, email: decoded.email };
		} catch {
			return null;
		}
	}
}
