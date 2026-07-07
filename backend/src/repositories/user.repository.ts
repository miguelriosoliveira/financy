import type {
	DbUserClient,
	UserCreateProps,
	UserUpdateProps,
} from '../db/db-user-client.interface.ts';
import type { UserModel } from '../models/user.model.ts';

export interface UserRepository {
	create(props: UserCreateProps): Promise<UserModel>;
	findById(id: string): Promise<UserModel | null>;
	findByEmail(email: string): Promise<UserModel | null>;
	update(id: string, props: UserUpdateProps): Promise<UserModel>;
}

export class DbUserRepository implements UserRepository {
	constructor(private readonly dbUserClient: DbUserClient) {}

	async create({ name, email, password }: UserCreateProps): Promise<UserModel> {
		return this.dbUserClient.user.create({ name, email, password });
	}

	async findById(id: string): Promise<UserModel | null> {
		return this.dbUserClient.user.findById(id);
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		return this.dbUserClient.user.findByEmail(email);
	}

	async update(id: string, props: UserUpdateProps): Promise<UserModel> {
		return this.dbUserClient.user.update(id, props);
	}
}
