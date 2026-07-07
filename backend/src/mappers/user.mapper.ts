import type { UserProfileOutput } from '../dtos/output/profile.output.ts';
import type { UserModel } from '../models/user.model.ts';

export function toUserProfileOutput(
	user: Pick<UserModel, 'id' | 'name' | 'email'>,
): UserProfileOutput {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}
