import type { UserModel } from '../models/user.model.ts';

export type UserCreateProps = Pick<UserModel, 'name' | 'email' | 'password'>;

export interface DbUserClient {
	user: {
		create(props: UserCreateProps): Promise<UserModel>;
		findByEmail(email: string): Promise<UserModel | null>;
	};
}
