import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '../env.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { UserModel } from '../models/user.model.ts';
import { PrismaClient } from '../prisma/generated/client.ts';
import type { CategoryCreateProps, DbCategoryClient } from './db-category-client.interface.ts';
import type { DbClient } from './db-client.interface.ts';
import type { DbUserClient, UserCreateProps } from './db-user-client.interface.ts';

export class PrismaDbClient implements DbClient, DbUserClient, DbCategoryClient {
	client: PrismaClient;

	constructor() {
		this.client = new PrismaClient({
			adapter: new PrismaBetterSqlite3({ url: env.DATABASE_URL }),
		});
	}

	async connect(): Promise<void> {
		await this.client.$connect();
		console.log('✅ Connected to database!');
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect();
		console.log('👋 Disconnected from database, bye!');
	}

	user = {
		findById: (id: string): Promise<UserModel | null> =>
			this.client.user.findUnique({ where: { id } }),

		findByEmail: (email: string): Promise<UserModel | null> =>
			this.client.user.findUnique({ where: { email } }),

		create: ({ name, email, password }: UserCreateProps): Promise<UserModel> =>
			this.client.user.create({ data: { name, email, password } }),
	};

	category = {
		findByName: (name: string): Promise<CategoryModel | null> =>
			this.client.category.findUnique({ where: { name } }),

		create: (props: CategoryCreateProps): Promise<CategoryModel> =>
			this.client.category.create({ data: props }),
	};
}
