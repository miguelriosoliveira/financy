import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class CategoryModel {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	name!: string;

	@Field(() => String)
	description?: string;

	@Field(() => String)
	icon!: string;

	@Field(() => String)
	color!: string;
}
