import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '../env.ts';
import type { CategoryModel } from '../models/category.model.ts';
import type { TransactionType } from '../models/transaction-type.ts';
import type { UserModel } from '../models/user.model.ts';
import type { DateRange } from '../utils/date-range.ts';
import type {
	CategoryCreateProps,
	CategoryUpdateProps,
	DbCategoryClient,
} from './db-category-client.interface.ts';
import type { DbClient } from './db-client.interface.ts';
import type {
	CategoryAggregation,
	CategoryAggregationFilters,
	DbTransactionClient,
	TransactionCreateProps,
	TransactionFindManyProps,
	TransactionUpdateProps,
	TransactionWithCategory,
} from './db-transaction-client.interface.ts';
import type { DbUserClient, UserCreateProps, UserUpdateProps } from './db-user-client.interface.ts';
import { PrismaClient } from './prisma/generated/client.ts';

export class PrismaDbClient
	implements DbClient, DbUserClient, DbCategoryClient, DbTransactionClient
{
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
		create: ({ name, email, password }: UserCreateProps): Promise<UserModel> =>
			this.client.user.create({ data: { name, email, password } }),

		findById: (id: string): Promise<UserModel | null> =>
			this.client.user.findUnique({ where: { id } }),

		findByEmail: (email: string): Promise<UserModel | null> =>
			this.client.user.findUnique({ where: { email } }),

		update: (id: string, { name }: UserUpdateProps): Promise<UserModel> =>
			this.client.user.update({ where: { id }, data: { name } }),
	};

	category = {
		create: (props: CategoryCreateProps): Promise<CategoryModel> =>
			this.client.category.create({ data: props }),

		findById: (id: string): Promise<CategoryModel | null> =>
			this.client.category.findUnique({ where: { id } }),

		findByName: (userId: string, name: string): Promise<CategoryModel | null> =>
			this.client.category.findUnique({ where: { userId_name: { userId, name } } }),

		findAll: (userId: string): Promise<CategoryModel[]> =>
			this.client.category.findMany({ where: { userId } }),

		update: (id: string, props: CategoryUpdateProps): Promise<CategoryModel> =>
			this.client.category.update({ where: { id }, data: props }),

		delete: (id: string): Promise<CategoryModel> => this.client.category.delete({ where: { id } }),
	};

	transaction = {
		create: async (props: TransactionCreateProps): Promise<TransactionWithCategory> => {
			const transaction = await this.client.transaction.create({
				data: props,
				include: { category: true },
			});
			return {
				...transaction,
				type: transaction.type as TransactionType,
			};
		},

		findById: async (id: string): Promise<TransactionWithCategory | null> => {
			const transaction = await this.client.transaction.findUnique({
				where: { id },
				include: { category: true },
			});
			if (!transaction) {
				return null;
			}
			return {
				...transaction,
				type: transaction.type as TransactionType,
			};
		},

		findMany: async (
			userId: string,
			{ skip, take }: TransactionFindManyProps,
		): Promise<TransactionWithCategory[]> => {
			const transactions = await this.client.transaction.findMany({
				where: { userId },
				skip,
				take,
				orderBy: [{ date: 'desc' }, { category: { name: 'asc' } }, { id: 'desc' }],
				include: { category: true },
			});
			return transactions.map(transaction => ({
				...transaction,
				type: transaction.type as TransactionType,
			}));
		},

		count: (userId: string): Promise<number> =>
			this.client.transaction.count({ where: { userId } }),

		sumByType: async (
			userId: string,
			type: TransactionType,
			dateRange?: DateRange,
		): Promise<number> => {
			const result = await this.client.transaction.aggregate({
				where: {
					userId,
					type,
					...(dateRange
						? {
								date: {
									gte: dateRange.start,
									lt: dateRange.end,
								},
							}
						: {}),
				},
				_sum: { amount: true },
			});

			return result._sum.amount ?? 0;
		},

		groupByCategory: async (
			userId: string,
			filters?: CategoryAggregationFilters,
		): Promise<CategoryAggregation[]> => {
			const groups = await this.client.transaction.groupBy({
				by: ['categoryId'],
				where: {
					userId,
					...(filters?.type ? { type: filters.type } : {}),
					...(filters?.dateRange
						? {
								date: {
									gte: filters.dateRange.start,
									lt: filters.dateRange.end,
								},
							}
						: {}),
				},
				_count: { id: true },
				_sum: { amount: true },
			});

			return groups.map(group => ({
				categoryId: group.categoryId,
				transactionCount: group._count.id,
				totalAmount: group._sum.amount ?? 0,
			}));
		},

		update: async (id: string, props: TransactionUpdateProps): Promise<TransactionWithCategory> => {
			const transaction = await this.client.transaction.update({
				where: { id },
				data: props,
				include: { category: true },
			});
			return {
				...transaction,
				type: transaction.type as TransactionType,
			};
		},

		delete: async (id: string): Promise<TransactionWithCategory> => {
			const transaction = await this.client.transaction.delete({
				where: { id },
				include: { category: true },
			});
			return {
				...transaction,
				type: transaction.type as TransactionType,
			};
		},
	};
}
