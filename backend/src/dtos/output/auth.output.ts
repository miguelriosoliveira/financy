import { Field, ObjectType } from 'type-graphql';
import { UserProfileOutput } from './profile.output.ts';

@ObjectType()
export class RegisterOutput {
	@Field(() => Boolean)
	success!: boolean;
}

@ObjectType()
export class LoginOutput {
	@Field(() => String)
	token!: string;

	@Field(() => String)
	refreshToken!: string;

	@Field(() => UserProfileOutput)
	user!: UserProfileOutput;
}
