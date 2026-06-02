import { Arg, Query, Resolver } from 'type-graphql';
import { UserModel } from '../models/user.model.ts';
import type { UserService } from '../services/user.service.ts';

@Resolver(() => UserModel)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => UserModel)
	async getUser(
		@Arg('id', () => String)
		id: string,
	): Promise<UserModel> {
		return this.userService.findUser(id);
	}
}
