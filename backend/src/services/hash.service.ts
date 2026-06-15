import bcrypt from 'bcryptjs';

export class HashService {
	async hash(plainPassword: string): Promise<string> {
		return bcrypt.hash(plainPassword, 10);
	}

	async compare(raw: string, hashed: string): Promise<boolean> {
		return bcrypt.compare(raw, hashed);
	}
}
