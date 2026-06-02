import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '../env.ts';
import { PrismaClient } from '../generated/prisma/client.ts';
import type { UserModel } from '../models/user.model.ts';
import type { DbClient } from './DbClient.ts';
import type { DbUserClient, UserCreateProps } from './DbUserClient.ts';

export class PrismaDbClient implements DbClient, DbUserClient {
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

	async findById(id: string): Promise<UserModel | null> {
		return this.client.user.findUnique({ where: { id } });
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		return this.client.user.findUnique({ where: { email } });
	}

	async create({ name, email, password }: UserCreateProps): Promise<UserModel> {
		return this.client.user.create({ data: { name, email, password } });
	}
}
