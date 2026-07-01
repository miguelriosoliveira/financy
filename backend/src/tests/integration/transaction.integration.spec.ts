import { ERROR_CODES } from '@financy/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const CREATE_CATEGORY = /* GraphQL */ `
	mutation CreateCategory($data: CreateCategoryInput!) {
		createCategory(data: $data) {
			id
			name
		}
	}
`;

const CREATE_TRANSACTION = /* GraphQL */ `
	mutation CreateTransaction($data: CreateTransactionInput!) {
		createTransaction(data: $data) {
			id
			amount
			type
			description
			date
			categoryId
			userId
		}
	}
`;

describe('Transaction (integration)', () => {
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

	async function createCategoryForUser() {
		const data = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();

		return response.body.data.createCategory.id as string;
	}

	it('creates a transaction and persists it', async () => {
		await ctx.createUser();
		const categoryId = await createCategoryForUser();
		const data = {
			amount: 89.5,
			type: 'EXPENSE',
			description: 'Dinner at restaurant',
			date: '2025-11-30T12:00:00.000Z',
			categoryId,
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_TRANSACTION, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.createTransaction).toMatchObject({
			amount: data.amount,
			type: data.type,
			description: data.description,
			categoryId,
			userId: 'test-user-id',
		});
		expect(response.body.data.createTransaction.id).toEqual(expect.any(String));

		const stored = await ctx.dbClient.client.transaction.findUnique({
			where: { id: response.body.data.createTransaction.id },
		});
		expect(stored).not.toBeNull();
		expect(stored).toMatchObject({
			amount: data.amount,
			type: data.type,
			description: data.description,
			categoryId,
			userId: 'test-user-id',
		});
	});

	it('rejects creating a transaction with a non-positive amount', async () => {
		await ctx.createUser();
		const categoryId = await createCategoryForUser();
		const data = {
			amount: 0,
			type: 'EXPENSE',
			description: 'Invalid transaction',
			date: '2025-11-30T12:00:00.000Z',
			categoryId,
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_TRANSACTION, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeDefined();
		expect(response.body.errors[0].message).toBe('Validation failed');
		expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
		expect(response.body.errors[0].extensions?.issues?.amount).toBeDefined();
	});

	it('rejects creating a transaction with an unknown category', async () => {
		await ctx.createUser();
		const data = {
			amount: 89.5,
			type: 'EXPENSE',
			description: 'Dinner at restaurant',
			date: '2025-11-30T12:00:00.000Z',
			categoryId: '00000000-0000-0000-0000-000000000000',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_TRANSACTION, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeDefined();
		expect(response.body.errors[0].message).toBe('Category not found');
		expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
	});
});
