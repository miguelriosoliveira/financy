import { Field, InputType } from 'type-graphql';

@InputType()
export class RegisterInput {
	@Field(() => String)
	name!: string;

	@Field(() => String)
	email!: string;

	@Field(() => String)
	password!: string;
}
