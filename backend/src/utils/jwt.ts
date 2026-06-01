import jwt from 'jsonwebtoken';
import { env } from '../env.ts';

type JwtPayload = {
	id: string;
	email: string;
};

export function signJwt(payload: JwtPayload, expiresIn?: number) {
	const secret = env.JWT_SECRET;
	return jwt.sign(payload, secret, { expiresIn });
}
