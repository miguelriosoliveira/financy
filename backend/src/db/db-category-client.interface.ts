import type { CategoryModel } from '../models/category.model.ts';

export type CategoryCreateProps = Pick<
	CategoryModel,
	'name' | 'description' | 'icon' | 'color' | 'userId'
>;

export type CategoryUpdateProps = Pick<CategoryModel, 'name' | 'description' | 'icon' | 'color'>;

export interface DbCategoryClient {
	category: {
		create(props: CategoryCreateProps): Promise<CategoryModel>;
		findById(id: string): Promise<CategoryModel | null>;
		findByName(userId: string, name: string): Promise<CategoryModel | null>;
		findAll(userId: string): Promise<CategoryModel[]>;
		update(id: string, props: CategoryUpdateProps): Promise<CategoryModel>;
	};
}
