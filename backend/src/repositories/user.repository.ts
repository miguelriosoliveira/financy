import type { DbUserClient, UserCreateProps } from '../db/db-user-client.interface.ts';
import type { UserModel } from '../models/user.model.ts';

export interface UserRepository {
	findById(id: string): Promise<UserModel>;
	findByEmail(email: string): Promise<UserModel | null>;
	create(props: UserCreateProps): Promise<UserModel>;
}

export class DbUserRepository implements UserRepository {
	constructor(private readonly dbUserClient: DbUserClient) {}

	async findById(id: string): Promise<UserModel> {
		const user = await this.dbUserClient.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		return this.dbUserClient.findByEmail(email);
	}

	async create({ name, email, password }: UserCreateProps): Promise<UserModel> {
		return this.dbUserClient.create({ name, email, password });
	}
}
