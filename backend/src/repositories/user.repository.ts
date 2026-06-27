import type { DbUserClient, UserCreateProps } from '../db/db-user-client.interface.ts';
import type { UserModel } from '../models/user.model.ts';

export interface UserRepository {
	findByEmail(email: string): Promise<UserModel | null>;
	create(props: UserCreateProps): Promise<UserModel>;
}

export class DbUserRepository implements UserRepository {
	constructor(private readonly dbUserClient: DbUserClient) {}

	async findByEmail(email: string): Promise<UserModel | null> {
		return this.dbUserClient.user.findByEmail(email);
	}

	async create({ name, email, password }: UserCreateProps): Promise<UserModel> {
		return this.dbUserClient.user.create({ name, email, password });
	}
}
