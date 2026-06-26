import type { CategoryCreateProps, DbCategoryClient } from '../db/db-category-client.interface.ts';
import type { CategoryModel } from '../models/category.model.ts';

export interface CategoryRepository {
	findByName(name: string): Promise<CategoryModel | null>;
	create(props: CategoryCreateProps): Promise<CategoryModel>;
}

export class DbCategoryRepository implements CategoryRepository {
	constructor(private readonly dbCategoryClient: DbCategoryClient) {}

	async findByName(name: string): Promise<CategoryModel | null> {
		return this.dbCategoryClient.category.findByName(name);
	}

	async create(props: CategoryCreateProps): Promise<CategoryModel> {
		return this.dbCategoryClient.category.create(props);
	}
}
