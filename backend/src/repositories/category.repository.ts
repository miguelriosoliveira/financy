import type {
	CategoryCreateProps,
	CategoryUpdateProps,
	DbCategoryClient,
} from '../db/db-category-client.interface.ts';
import type { CategoryModel } from '../models/category.model.ts';

export interface CategoryRepository {
	create(props: CategoryCreateProps): Promise<CategoryModel>;
	findById(id: string): Promise<CategoryModel | null>;
	findByName(userId: string, name: string): Promise<CategoryModel | null>;
	findAll(userId: string): Promise<CategoryModel[]>;
	update(id: string, props: CategoryUpdateProps): Promise<CategoryModel>;
}

export class DbCategoryRepository implements CategoryRepository {
	constructor(private readonly dbCategoryClient: DbCategoryClient) {}

	async create(props: CategoryCreateProps): Promise<CategoryModel> {
		return this.dbCategoryClient.category.create(props);
	}

	async findById(id: string): Promise<CategoryModel | null> {
		return this.dbCategoryClient.category.findById(id);
	}

	async findByName(userId: string, name: string): Promise<CategoryModel | null> {
		return this.dbCategoryClient.category.findByName(userId, name);
	}

	async findAll(userId: string): Promise<CategoryModel[]> {
		return this.dbCategoryClient.category.findAll(userId);
	}

	async update(id: string, props: CategoryUpdateProps): Promise<CategoryModel> {
		return this.dbCategoryClient.category.update(id, props);
	}
}
