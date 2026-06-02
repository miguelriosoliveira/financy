import type { DbUserClient, UserCreateProps } from '../db/DbUserClient.ts';
import type { UserModel } from '../models/user.model.ts';

export class UserRepository {
	constructor(private readonly dbUserClient: DbUserClient) {}

	async findById(id: string): Promise<UserModel> {
		const user = await this.dbUserClient.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}

	async findByEmail(email: string): Promise<UserModel> {
		const user = await this.dbUserClient.findByEmail(email);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}

	async create({ name, email, password }: UserCreateProps): Promise<UserModel> {
		return this.dbUserClient.create({ name, email, password });
	}
}
