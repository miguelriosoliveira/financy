import type { CategoryModel } from '../models/category.model.ts';

export type CategoryCreateProps = Pick<CategoryModel, 'name' | 'description' | 'icon' | 'color'>;

export interface DbCategoryClient {
	create(props: CategoryCreateProps): Promise<CategoryModel>;
}
