import bcrypt from 'bcryptjs';

export class HashService {
	async hash(plainPassword: string) {
		return bcrypt.hash(plainPassword, 10);
	}
}
