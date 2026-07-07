import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class UserProfileOutput {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;

	@Field(() => String)
	email!: string;
}
