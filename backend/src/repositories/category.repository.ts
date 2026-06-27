import type { CategoryCreateProps, DbCategoryClient } from '../db/db-category-client.interface.ts';
import type { CategoryModel } from '../models/category.model.ts';

export interface CategoryRepository {
	create(props: CategoryCreateProps): Promise<CategoryModel>;
	findByName(name: string): Promise<CategoryModel | null>;
	findAll(): Promise<CategoryModel[]>;
}

export class DbCategoryRepository implements CategoryRepository {
	constructor(private readonly dbCategoryClient: DbCategoryClient) {}

	async create(props: CategoryCreateProps): Promise<CategoryModel> {
		return this.dbCategoryClient.category.create(props);
	}

	async findByName(name: string): Promise<CategoryModel | null> {
		return this.dbCategoryClient.category.findByName(name);
	}

	async findAll(): Promise<CategoryModel[]> {
		return this.dbCategoryClient.category.findAll();
	}
}
