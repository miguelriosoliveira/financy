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
}
