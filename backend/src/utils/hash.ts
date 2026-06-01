import bcrypt from 'bcryptjs';

export async function hash(plainPassword: string) {
	return bcrypt.hash(plainPassword, 10);
}
