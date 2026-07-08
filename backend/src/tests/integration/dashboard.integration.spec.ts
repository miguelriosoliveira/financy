import { ERROR_CODES } from '@financy/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const CREATE_CATEGORY = /* GraphQL */ `
	mutation CreateCategory($data: CreateCategoryInput!) {
		createCategory(data: $data) {
			id
		}
	}
`;

const CREATE_TRANSACTION = /* GraphQL */ `
	mutation CreateTransaction($data: CreateTransactionInput!) {
		createTransaction(data: $data) {
			id
		}
	}
`;

const GET_DASHBOARD_SUMMARY = /* GraphQL */ `
	query GetDashboardSummary {
		getDashboardSummary {
			totalBalance
			monthlyIncome
			monthlyExpenses
		}
	}
`;

function currentMonthDate(day: number): string {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day)).toISOString();
}

function lastMonthDate(day: number): string {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, day)).toISOString();
}

describe('Dashboard (integration)', () => {
	let ctx: TestApp;

	beforeAll(async () => {
		ctx = await setupTestApp();
	});

	beforeEach(async () => {
		await ctx.clean();
	});

	afterAll(async () => {
		await ctx.close();
	});

	async function createCategoryForUser(authOverrides?: Parameters<TestApp['authHeader']>[0]) {
		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader(authOverrides))
			.send({
				query: CREATE_CATEGORY,
				variables: {
					data: {
						name: 'Food',
						description: 'Groceries and dining',
						icon: 'utensils',
						color: '#ff0000',
					},
				},
			});

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();

		return response.body.data.createCategory.id as string;
	}

	async function createTransactionForUser(
		categoryId: string,
		data: {
			amount: number;
			type: string;
			description: string;
			date: string;
		},
		authOverrides?: Parameters<TestApp['authHeader']>[0],
	) {
		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader(authOverrides))
			.send({
				query: CREATE_TRANSACTION,
				variables: { data: { ...data, categoryId } },
			});

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();
	}

	describe('getDashboardSummary', () => {
		it('returns balance and current-month income/expenses', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();

			await createTransactionForUser(categoryId, {
				amount: 500,
				type: 'INCOME',
				description: 'Salary this month',
				date: currentMonthDate(10),
			});
			await createTransactionForUser(categoryId, {
				amount: 200,
				type: 'EXPENSE',
				description: 'Groceries this month',
				date: currentMonthDate(12),
			});
			await createTransactionForUser(categoryId, {
				amount: 1000,
				type: 'INCOME',
				description: 'Salary last month',
				date: lastMonthDate(10),
			});
			await createTransactionForUser(categoryId, {
				amount: 300,
				type: 'EXPENSE',
				description: 'Groceries last month',
				date: lastMonthDate(12),
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_DASHBOARD_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getDashboardSummary).toEqual({
				totalBalance: 1000,
				monthlyIncome: 500,
				monthlyExpenses: 200,
			});
		});

		it('does not include another user transactions', async () => {
			await ctx.createUser({ id: 'user-a', email: 'a@example.com' });
			await ctx.createUser({ id: 'user-b', email: 'b@example.com' });

			const categoryA = await createCategoryForUser({ id: 'user-a', email: 'a@example.com' });
			const categoryB = await createCategoryForUser({ id: 'user-b', email: 'b@example.com' });

			await createTransactionForUser(
				categoryA,
				{
					amount: 100,
					type: 'INCOME',
					description: 'User A income',
					date: currentMonthDate(5),
				},
				{ id: 'user-a', email: 'a@example.com' },
			);
			await createTransactionForUser(
				categoryB,
				{
					amount: 999,
					type: 'INCOME',
					description: 'User B income',
					date: currentMonthDate(5),
				},
				{ id: 'user-b', email: 'b@example.com' },
			);

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader({ id: 'user-a', email: 'a@example.com' }))
				.send({ query: GET_DASHBOARD_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getDashboardSummary).toEqual({
				totalBalance: 100,
				monthlyIncome: 100,
				monthlyExpenses: 0,
			});
		});

		it('rejects getDashboardSummary when unauthenticated', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: GET_DASHBOARD_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
		});
	});
});
