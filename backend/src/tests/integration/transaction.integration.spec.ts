import { ERROR_CODES } from '@financy/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { CreateCategoryInput } from '../../dtos/input/category.input.ts';
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
			category {
				id
				name
				icon
				color
			}
		}
	}
`;

const EDIT_TRANSACTION = /* GraphQL */ `
	mutation EditTransaction($id: ID!, $data: UpdateTransactionInput!) {
		editTransaction(id: $id, data: $data) {
			id
			amount
			type
			description
			date
			categoryId
			userId
			category {
				id
				name
				icon
				color
			}
		}
	}
`;

const DELETE_TRANSACTION = /* GraphQL */ `
	mutation DeleteTransaction($id: ID!) {
		deleteTransaction(id: $id) {
			id
			amount
			type
			description
			date
			categoryId
			userId
			category {
				id
				name
				icon
				color
			}
		}
	}
`;

const GET_TRANSACTIONS = /* GraphQL */ `
	query GetTransactions($page: Int!, $pageSize: Int!) {
		getTransactions(page: $page, pageSize: $pageSize) {
			items {
				id
				amount
				type
				description
				date
				categoryId
				userId
				category {
					id
					name
					icon
					color
				}
			}
			totalCount
			page
			pageSize
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

	async function createCategoryForUser(
		authOverrides?: Parameters<TestApp['authHeader']>[0],
		data: CreateCategoryInput = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		},
	) {
		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader(authOverrides))
			.send({ query: CREATE_CATEGORY, variables: { data } });

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

		return response.body.data.createTransaction;
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

	describe('editTransaction', () => {
		it('edits an owned transaction and persists the changes', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});
			const updateData = {
				amount: 120,
				type: 'INCOME',
				description: 'Updated description',
				date: '2025-12-01T12:00:00.000Z',
				categoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_TRANSACTION, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.editTransaction).toMatchObject({
				...updateData,
				id: created.id,
				userId: 'test-user-id',
			});

			const stored = await ctx.dbClient.client.transaction.findUnique({
				where: { id: created.id },
			});
			expect(stored).toMatchObject({
				amount: updateData.amount,
				type: updateData.type,
				description: updateData.description,
				categoryId,
				userId: 'test-user-id',
			});
		});

		it('returns TRANSACTION_NOT_FOUND when editing another user transaction', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const otherCategoryId = await createCategoryForUser(
				{ id: 'other-user-id', email: 'other@example.com' },
				{ name: 'Other Food', icon: 'utensils', color: '#ff0000' },
			);
			const created = await createTransactionForUser(
				otherCategoryId,
				{
					amount: 89.5,
					type: 'EXPENSE',
					description: 'Other user transaction',
					date: '2025-11-30T12:00:00.000Z',
				},
				{ id: 'other-user-id', email: 'other@example.com' },
			);
			const categoryId = await createCategoryForUser();
			const updateData = {
				amount: 120,
				type: 'INCOME',
				description: 'Updated description',
				date: '2025-12-01T12:00:00.000Z',
				categoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_TRANSACTION, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Transaction not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.client.transaction.findUnique({
				where: { id: created.id },
			});
			expect(stored?.description).toBe('Other user transaction');
		});

		it('returns TRANSACTION_NOT_FOUND for a non-existent id', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const updateData = {
				amount: 120,
				type: 'INCOME',
				description: 'Updated description',
				date: '2025-12-01T12:00:00.000Z',
				categoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: EDIT_TRANSACTION,
					variables: { id: '00000000-0000-0000-0000-000000000000', data: updateData },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Transaction not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(response.body.data).toBeNull();
		});

		it('returns CATEGORY_NOT_FOUND when using another user category', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const categoryId = await createCategoryForUser();
			const otherCategoryId = await createCategoryForUser(
				{ id: 'other-user-id', email: 'other@example.com' },
				{ name: 'Other Food', icon: 'utensils', color: '#ff0000' },
			);
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});
			const updateData = {
				amount: 120,
				type: 'INCOME',
				description: 'Updated description',
				date: '2025-12-01T12:00:00.000Z',
				categoryId: otherCategoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_TRANSACTION, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Category not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(response.body.data).toBeNull();
		});

		it('rejects editTransaction when unauthenticated', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});
			const updateData = {
				amount: 120,
				type: 'INCOME',
				description: 'Updated description',
				date: '2025-12-01T12:00:00.000Z',
				categoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: EDIT_TRANSACTION, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});

		it('rejects editing a transaction with a non-positive amount', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});
			const updateData = {
				amount: 0,
				type: 'EXPENSE',
				description: 'Invalid transaction',
				date: '2025-11-30T12:00:00.000Z',
				categoryId,
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_TRANSACTION, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.amount).toBeDefined();
			expect(response.body.data).toBeNull();
		});
	});

	describe('deleteTransaction', () => {
		it('deletes an owned transaction and removes it from the database', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: DELETE_TRANSACTION, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.deleteTransaction).toMatchObject({
				id: created.id,
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				categoryId,
				userId: 'test-user-id',
				category: {
					id: categoryId,
					name: 'Food',
					icon: 'utensils',
					color: '#ff0000',
				},
			});

			const stored = await ctx.dbClient.client.transaction.findUnique({
				where: { id: created.id },
			});
			expect(stored).toBeNull();
		});

		it('returns TRANSACTION_NOT_FOUND when deleting another user transaction', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const otherCategoryId = await createCategoryForUser(
				{ id: 'other-user-id', email: 'other@example.com' },
				{ name: 'Other Food', icon: 'utensils', color: '#ff0000' },
			);
			const created = await createTransactionForUser(
				otherCategoryId,
				{
					amount: 89.5,
					type: 'EXPENSE',
					description: 'Other user transaction',
					date: '2025-11-30T12:00:00.000Z',
				},
				{ id: 'other-user-id', email: 'other@example.com' },
			);

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: DELETE_TRANSACTION, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Transaction not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.client.transaction.findUnique({
				where: { id: created.id },
			});
			expect(stored).not.toBeNull();
		});

		it('returns TRANSACTION_NOT_FOUND for a non-existent id', async () => {
			await ctx.createUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: DELETE_TRANSACTION,
					variables: { id: '00000000-0000-0000-0000-000000000000' },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Transaction not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.TRANSACTION_NOT_FOUND);
			expect(response.body.data).toBeNull();
		});

		it('rejects deleteTransaction when unauthenticated', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			const created = await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: DELETE_TRANSACTION, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.client.transaction.findUnique({
				where: { id: created.id },
			});
			expect(stored).not.toBeNull();
		});
	});

	describe('getTransactions', () => {
		it('returns an empty page when no transactions exist', async () => {
			await ctx.createUser();
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getTransactions).toEqual({
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: 10,
			});
		});

		it('returns only the authenticated user transactions', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const categoryId = await createCategoryForUser();
			const otherCategoryId = await createCategoryForUser(
				{ id: 'other-user-id', email: 'other@example.com' },
				{ name: 'Other Food', icon: 'utensils', color: '#ff0000' },
			);

			await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'My transaction',
				date: '2025-11-30T12:00:00.000Z',
			});
			await createTransactionForUser(
				otherCategoryId,
				{
					amount: 50,
					type: 'EXPENSE',
					description: 'Other user transaction',
					date: '2025-11-29T12:00:00.000Z',
				},
				{ id: 'other-user-id', email: 'other@example.com' },
			);

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getTransactions.totalCount).toBe(1);
			expect(response.body.data.getTransactions.items).toHaveLength(1);
			expect(response.body.data.getTransactions.items[0].description).toBe('My transaction');
		});

		it('includes the category on each transaction', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Dinner at restaurant',
				date: '2025-11-30T12:00:00.000Z',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getTransactions.items[0].category).toMatchObject({
				id: categoryId,
				name: 'Food',
				icon: 'utensils',
				color: '#ff0000',
			});
		});

		it('orders by date desc with same-date rows ordered by category name asc', async () => {
			await ctx.createUser();
			const foodCategoryId = await createCategoryForUser(undefined, {
				name: 'Food',
				icon: 'utensils',
				color: '#ff0000',
			});
			const transportCategoryId = await createCategoryForUser(undefined, {
				name: 'Transport',
				icon: 'car',
				color: '#0000ff',
			});

			await createTransactionForUser(transportCategoryId, {
				amount: 20,
				type: 'EXPENSE',
				description: 'Same day transport',
				date: '2025-11-30T12:00:00.000Z',
			});
			await createTransactionForUser(foodCategoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Same day food',
				date: '2025-11-30T12:00:00.000Z',
			});
			await createTransactionForUser(foodCategoryId, {
				amount: 50,
				type: 'EXPENSE',
				description: 'Earlier day',
				date: '2025-11-29T12:00:00.000Z',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(
				response.body.data.getTransactions.items.map((t: { description: string }) => t.description),
			).toEqual(['Same day food', 'Same day transport', 'Earlier day']);
		});

		it('returns the next slice on page 2 with correct totalCount', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();

			for (let i = 1; i <= 12; i++) {
				await createTransactionForUser(categoryId, {
					amount: i,
					type: 'EXPENSE',
					description: `Transaction ${i}`,
					date: `2025-11-${String(i).padStart(2, '0')}T12:00:00.000Z`,
				});
			}

			const page1 = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });
			expect(page1.body.errors).toBeUndefined();
			expect(page1.body.data.getTransactions.totalCount).toBe(12);
			expect(page1.body.data.getTransactions.items).toHaveLength(10);

			const page2 = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 2, pageSize: 10 } });
			expect(page2.body.errors).toBeUndefined();
			expect(page2.body.data.getTransactions.totalCount).toBe(12);
			expect(page2.body.data.getTransactions.items).toHaveLength(2);

			const page1Ids = page1.body.data.getTransactions.items.map((t: { id: string }) => t.id);
			const page2Ids = page2.body.data.getTransactions.items.map((t: { id: string }) => t.id);
			expect(page1Ids.some((id: string) => page2Ids.includes(id))).toBe(false);
		});

		it('returns empty items when page is beyond the last page', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser();
			await createTransactionForUser(categoryId, {
				amount: 89.5,
				type: 'EXPENSE',
				description: 'Only transaction',
				date: '2025-11-30T12:00:00.000Z',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 5, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getTransactions).toEqual({
				items: [],
				totalCount: 1,
				page: 5,
				pageSize: 10,
			});
		});

		it('rejects pageSize greater than 100', async () => {
			await ctx.createUser();
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 101 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.pageSize).toBeDefined();
		});

		it('rejects page less than 1', async () => {
			await ctx.createUser();
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_TRANSACTIONS, variables: { page: 0, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.page).toBeDefined();
		});

		it('rejects getTransactions when unauthenticated', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: GET_TRANSACTIONS, variables: { page: 1, pageSize: 10 } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});
	});
});
