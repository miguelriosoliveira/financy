import type { CategoryCreateProps, DbCategoryClient } from '../db/db-category-client.interface.ts';
import type { CategoryModel } from '../models/category.model.ts';

export interface CategoryRepository {
	create(props: CategoryCreateProps): Promise<CategoryModel>;
}

export class DbCategoryRepository implements CategoryRepository {
	constructor(private readonly dbCategoryClient: DbCategoryClient) {}

	async create(props: CategoryCreateProps): Promise<CategoryModel> {
		return this.dbCategoryClient.create(props);
	}
}
