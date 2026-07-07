import { updateProfileSchema } from '@financy/shared';
import { Arg, Authorized, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { UserInfo } from '../auth/user-info.decorator.ts';
import { UpdateProfileInput } from '../dtos/input/profile.input.ts';
import { UserProfileOutput } from '../dtos/output/profile.output.ts';
import { Validate } from '../middlewares/validate.middleware.ts';
import type { JwtPayload } from '../services/jwt.service.ts';
import type { UserService } from '../services/user.service.ts';

@Authorized()
@Resolver(() => UserProfileOutput)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => UserProfileOutput)
	async getMe(@UserInfo() user: JwtPayload): Promise<UserProfileOutput> {
		return this.userService.getMe(user.id);
	}

	@Mutation(() => UserProfileOutput)
	@UseMiddleware(Validate(updateProfileSchema))
	async updateProfile(
		@Arg('data', () => UpdateProfileInput) data: UpdateProfileInput,
		@UserInfo() user: JwtPayload,
	): Promise<UserProfileOutput> {
		return this.userService.updateProfile(user.id, data);
	}
}
