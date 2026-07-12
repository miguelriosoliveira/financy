import { ERROR_CODES } from '@financy/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const CREATE_CATEGORY = /* GraphQL */ `
	mutation CreateCategory($data: CreateCategoryInput!) {
		createCategory(data: $data) {
			id
			name
			description
			icon
			color
		}
	}
`;

const EDIT_CATEGORY = /* GraphQL */ `
	mutation EditCategory($id: ID!, $data: UpdateCategoryInput!) {
		editCategory(id: $id, data: $data) {
			id
			name
			description
			icon
			color
		}
	}
`;

const GET_CATEGORIES = /* GraphQL */ `
	query GetCategories {
		getCategories {
			id
			name
			description
			icon
			color
		}
	}
`;

const DELETE_CATEGORY = /* GraphQL */ `
	mutation DeleteCategory($id: ID!) {
		deleteCategory(id: $id) {
			id
			name
			description
			icon
			color
		}
	}
`;

describe('Category (integration)', () => {
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

	it('creates a category and persists it', async () => {
		await ctx.createUser();
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
		expect(response.body.data.createCategory).toMatchObject(data);
		expect(response.body.data.createCategory.id).toEqual(expect.any(String));

		const stored = await ctx.dbClient.category.findByName('test-user-id', data.name);
		expect(stored).not.toBeNull();
		expect(stored).toMatchObject(data);
	});

	it('creates a category without a description', async () => {
		await ctx.createUser();
		const data = {
			name: 'Transport',
			icon: 'car',
			color: '#0000ff',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.createCategory).toMatchObject({
			name: data.name,
			icon: data.icon,
			color: data.color,
			description: null,
		});
	});

	it('rejects creating a category with a duplicate name for the same user', async () => {
		await ctx.createUser();
		const data = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		};

		const first = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });
		expect(first.body.errors).toBeUndefined();

		const second = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(second.body.errors).toBeDefined();
		expect(second.body.errors[0].message).toBe('Category already exists');
		expect(second.body.errors[0].extensions?.code).toBe('CATEGORY_ALREADY_EXISTS');

		const all = await ctx.dbClient.client.category.findMany({
			where: { userId: 'test-user-id', name: data.name },
		});
		expect(all).toHaveLength(1);
	});

	it('allows different users to create categories with the same name', async () => {
		await ctx.createUser();
		await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
		const data = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		};

		const first = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });
		expect(first.body.errors).toBeUndefined();

		const second = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader({ id: 'other-user-id', email: 'other@example.com' }))
			.send({ query: CREATE_CATEGORY, variables: { data } });
		expect(second.body.errors).toBeUndefined();

		const all = await ctx.dbClient.client.category.findMany({ where: { name: data.name } });
		expect(all).toHaveLength(2);
	});

	it('rejects creating a category with an empty name', async () => {
		await ctx.createUser();
		const data = {
			name: '',
			description: 'Invalid category',
			icon: 'utensils',
			color: '#ff0000',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.set('Authorization', ctx.authHeader())
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeDefined();
		expect(response.body.errors[0].message).toBe('Validation failed');
		expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
		expect(response.body.errors[0].extensions?.issues?.name).toBeDefined();
		expect(response.body.data).toBeNull();

		const stored = await ctx.dbClient.category.findByName('test-user-id', data.name);
		expect(stored).toBeNull();
	});

	it('rejects createCategory when unauthenticated', async () => {
		const data = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeDefined();
		expect(response.body.errors[0].message).toBe('Unauthorized');
		expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
		expect(response.body.data).toBeNull();

		const stored = await ctx.dbClient.category.findByName('test-user-id', data.name);
		expect(stored).toBeNull();
	});

	describe('getCategories', () => {
		it('returns an empty list when no categories exist', async () => {
			await ctx.createUser();
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_CATEGORIES });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategories).toEqual([]);
		});

		it('returns only the authenticated user categories', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const data = {
				name: 'Food',
				description: 'Groceries and dining',
				icon: 'utensils',
				color: '#ff0000',
			};

			const createResponse = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: CREATE_CATEGORY, variables: { data } });
			expect(createResponse.body.errors).toBeUndefined();

			await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader({ id: 'other-user-id', email: 'other@example.com' }))
				.send({
					query: CREATE_CATEGORY,
					variables: { data: { ...data, name: 'Other Food' } },
				});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_CATEGORIES });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategories).toHaveLength(1);
			expect(response.body.data.getCategories[0]).toMatchObject(data);
		});

		it('rejects getCategories when unauthenticated', async () => {
			const response = await request(ctx.app).post('/graphql').send({ query: GET_CATEGORIES });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});

		it('rejects getCategories with an invalid token', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', 'Bearer invalid-token')
				.send({ query: GET_CATEGORIES });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});
	});

	describe('editCategory', () => {
		async function createCategoryForUser(
			authOverrides?: Parameters<TestApp['authHeader']>[0],
			data = {
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
			expect(response.body.errors).toBeUndefined();
			return response.body.data.createCategory as { id: string };
		}

		it('edits an owned category and persists the changes', async () => {
			await ctx.createUser();
			const created = await createCategoryForUser();
			const updateData = {
				name: 'Groceries',
				description: 'Weekly groceries',
				icon: 'shopping-cart',
				color: '#00ff00',
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_CATEGORY, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.editCategory).toMatchObject(updateData);

			const stored = await ctx.dbClient.category.findById(created.id);
			expect(stored).toMatchObject(updateData);
		});

		it('returns CATEGORY_NOT_FOUND when editing another user category', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const created = await createCategoryForUser({
				id: 'other-user-id',
				email: 'other@example.com',
			});
			const updateData = {
				name: 'Groceries',
				description: 'Weekly groceries',
				icon: 'shopping-cart',
				color: '#00ff00',
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_CATEGORY, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Category not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.category.findById(created.id);
			expect(stored?.name).toBe('Food');
		});

		it('returns CATEGORY_NOT_FOUND for a non-existent id', async () => {
			await ctx.createUser();
			const updateData = {
				name: 'Groceries',
				description: 'Weekly groceries',
				icon: 'shopping-cart',
				color: '#00ff00',
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: EDIT_CATEGORY,
					variables: { id: '00000000-0000-0000-0000-000000000000', data: updateData },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Category not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(response.body.data).toBeNull();
		});

		it('rejects editCategory when unauthenticated', async () => {
			await ctx.createUser();
			const created = await createCategoryForUser();
			const updateData = {
				name: 'Groceries',
				description: 'Weekly groceries',
				icon: 'shopping-cart',
				color: '#00ff00',
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: EDIT_CATEGORY, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});

		it('rejects editing a category with an empty name', async () => {
			await ctx.createUser();
			const created = await createCategoryForUser();
			const updateData = {
				name: '',
				description: 'Invalid category',
				icon: 'utensils',
				color: '#ff0000',
			};

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: EDIT_CATEGORY, variables: { id: created.id, data: updateData } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.name).toBeDefined();
			expect(response.body.data).toBeNull();
		});
	});

	describe('deleteCategory', () => {
		async function createCategoryForUser(
			authOverrides?: Parameters<TestApp['authHeader']>[0],
			data = {
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
			expect(response.body.errors).toBeUndefined();
			return response.body.data.createCategory as { id: string };
		}

		it('deletes an owned category and removes it from the database', async () => {
			await ctx.createUser();
			const created = await createCategoryForUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: DELETE_CATEGORY, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.deleteCategory).toMatchObject({
				id: created.id,
				name: 'Food',
				description: 'Groceries and dining',
				icon: 'utensils',
				color: '#ff0000',
			});

			const stored = await ctx.dbClient.category.findById(created.id);
			expect(stored).toBeNull();
		});

		it('allows recreating a category with the same name after deletion', async () => {
			await ctx.createUser();
			const data = {
				name: 'Food',
				description: 'Groceries and dining',
				icon: 'utensils',
				color: '#ff0000',
			};
			const created = await createCategoryForUser(undefined, data);

			const duplicate = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: CREATE_CATEGORY, variables: { data } });

			expect(duplicate.status).toBe(200);
			expect(duplicate.body.errors).toBeDefined();
			expect(duplicate.body.errors[0].message).toBe('Category already exists');
			expect(duplicate.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_ALREADY_EXISTS);

			const deleteResponse = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: DELETE_CATEGORY, variables: { id: created.id } });

			expect(deleteResponse.status).toBe(200);
			expect(deleteResponse.body.errors).toBeUndefined();

			const recreate = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: CREATE_CATEGORY, variables: { data } });

			expect(recreate.status).toBe(200);
			expect(recreate.body.errors).toBeUndefined();
			expect(recreate.body.data.createCategory).toMatchObject(data);
			expect(recreate.body.data.createCategory.id).not.toBe(created.id);
			expect(recreate.body.data.createCategory.id).toEqual(expect.any(String));
		});

		it('returns CATEGORY_NOT_FOUND when deleting another user category', async () => {
			await ctx.createUser();
			await ctx.createUser({ id: 'other-user-id', email: 'other@example.com' });
			const created = await createCategoryForUser({
				id: 'other-user-id',
				email: 'other@example.com',
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: DELETE_CATEGORY, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Category not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.category.findById(created.id);
			expect(stored).not.toBeNull();
		});

		it('returns CATEGORY_NOT_FOUND for a non-existent id', async () => {
			await ctx.createUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: DELETE_CATEGORY,
					variables: { id: '00000000-0000-0000-0000-000000000000' },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Category not found');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.CATEGORY_NOT_FOUND);
			expect(response.body.data).toBeNull();
		});

		it('rejects deleteCategory when unauthenticated', async () => {
			await ctx.createUser();
			const created = await createCategoryForUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: DELETE_CATEGORY, variables: { id: created.id } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Unauthorized');
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.category.findById(created.id);
			expect(stored).not.toBeNull();
		});
	});

	describe('getCategories with includeStats', () => {
		const CREATE_TRANSACTION = /* GraphQL */ `
			mutation CreateTransaction($data: CreateTransactionInput!) {
				createTransaction(data: $data) {
					id
				}
			}
		`;

		const GET_CATEGORIES_WITH_STATS = /* GraphQL */ `
			query GetCategories($includeStats: Boolean!) {
				getCategories(includeStats: $includeStats) {
					id
					name
					transactionCount
					totalAmount
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

		async function createCategoryForUser(
			name: string,
			authOverrides?: Parameters<TestApp['authHeader']>[0],
		) {
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader(authOverrides))
				.send({
					query: CREATE_CATEGORY,
					variables: {
						data: {
							name,
							icon: 'tag',
							color: '#000000',
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

		it('returns null stats when includeStats is false', async () => {
			await ctx.createUser();
			const categoryId = await createCategoryForUser('Food');
			await createTransactionForUser(categoryId, {
				amount: 50,
				type: 'EXPENSE',
				description: 'Groceries',
				date: currentMonthDate(10),
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: GET_CATEGORIES_WITH_STATS,
					variables: { includeStats: false },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategories).toEqual([
				{
					id: categoryId,
					name: 'Food',
					transactionCount: null,
					totalAmount: null,
				},
			]);
		});

		it('returns current-month expense stats per category when includeStats is true', async () => {
			await ctx.createUser();
			const foodId = await createCategoryForUser('Food');
			const transportId = await createCategoryForUser('Transport');

			await createTransactionForUser(foodId, {
				amount: 50,
				type: 'EXPENSE',
				description: 'Groceries this month',
				date: currentMonthDate(10),
			});
			await createTransactionForUser(foodId, {
				amount: 30,
				type: 'EXPENSE',
				description: 'More groceries this month',
				date: currentMonthDate(15),
			});
			await createTransactionForUser(foodId, {
				amount: 100,
				type: 'EXPENSE',
				description: 'Groceries last month',
				date: lastMonthDate(10),
			});
			await createTransactionForUser(foodId, {
				amount: 200,
				type: 'INCOME',
				description: 'Refund',
				date: currentMonthDate(12),
			});
			await createTransactionForUser(transportId, {
				amount: 25,
				type: 'EXPENSE',
				description: 'Bus fare',
				date: currentMonthDate(8),
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: GET_CATEGORIES_WITH_STATS,
					variables: { includeStats: true },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategories).toEqual(
				expect.arrayContaining([
					{
						id: foodId,
						name: 'Food',
						transactionCount: 2,
						totalAmount: 80,
					},
					{
						id: transportId,
						name: 'Transport',
						transactionCount: 1,
						totalAmount: 25,
					},
				]),
			);
		});

		it('does not include another user category stats', async () => {
			await ctx.createUser({ id: 'user-a', email: 'a@example.com' });
			await ctx.createUser({ id: 'user-b', email: 'b@example.com' });

			const categoryA = await createCategoryForUser('Food', {
				id: 'user-a',
				email: 'a@example.com',
			});
			const categoryB = await createCategoryForUser('Food', {
				id: 'user-b',
				email: 'b@example.com',
			});

			await createTransactionForUser(
				categoryA,
				{
					amount: 40,
					type: 'EXPENSE',
					description: 'User A expense',
					date: currentMonthDate(5),
				},
				{ id: 'user-a', email: 'a@example.com' },
			);
			await createTransactionForUser(
				categoryB,
				{
					amount: 999,
					type: 'EXPENSE',
					description: 'User B expense',
					date: currentMonthDate(5),
				},
				{ id: 'user-b', email: 'b@example.com' },
			);

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader({ id: 'user-a', email: 'a@example.com' }))
				.send({
					query: GET_CATEGORIES_WITH_STATS,
					variables: { includeStats: true },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategories).toEqual([
				{
					id: categoryA,
					name: 'Food',
					transactionCount: 1,
					totalAmount: 40,
				},
			]);
		});
	});

	describe('getCategoriesSummary', () => {
		const CREATE_TRANSACTION = /* GraphQL */ `
			mutation CreateTransaction($data: CreateTransactionInput!) {
				createTransaction(data: $data) {
					id
				}
			}
		`;

		const GET_CATEGORIES_SUMMARY = /* GraphQL */ `
			query GetCategoriesSummary {
				getCategoriesSummary {
					transactionCount
					mostUsedCategory {
						id
						name
						transactionCount
					}
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

		async function createCategoryForUser(
			name: string,
			authOverrides?: Parameters<TestApp['authHeader']>[0],
		) {
			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader(authOverrides))
				.send({
					query: CREATE_CATEGORY,
					variables: {
						data: {
							name,
							icon: 'tag',
							color: '#000000',
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

		it('returns zero total and null most-used category for a new user', async () => {
			await ctx.createUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_CATEGORIES_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategoriesSummary).toEqual({
				transactionCount: 0,
				mostUsedCategory: null,
			});
		});

		it('counts all transaction types and months and picks the most-used category', async () => {
			await ctx.createUser();
			const foodId = await createCategoryForUser('Food');
			const transportId = await createCategoryForUser('Transport');

			await createTransactionForUser(foodId, {
				amount: 50,
				type: 'EXPENSE',
				description: 'Groceries this month',
				date: currentMonthDate(10),
			});
			await createTransactionForUser(foodId, {
				amount: 30,
				type: 'EXPENSE',
				description: 'More groceries this month',
				date: currentMonthDate(15),
			});
			await createTransactionForUser(foodId, {
				amount: 100,
				type: 'EXPENSE',
				description: 'Groceries last month',
				date: lastMonthDate(10),
			});
			await createTransactionForUser(foodId, {
				amount: 200,
				type: 'INCOME',
				description: 'Refund',
				date: currentMonthDate(12),
			});
			await createTransactionForUser(transportId, {
				amount: 25,
				type: 'EXPENSE',
				description: 'Bus fare',
				date: currentMonthDate(8),
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_CATEGORIES_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategoriesSummary).toEqual({
				transactionCount: 5,
				mostUsedCategory: {
					id: foodId,
					name: 'Food',
					transactionCount: 4,
				},
			});
		});

		it('breaks ties by category name ascending', async () => {
			await ctx.createUser();
			const alphaId = await createCategoryForUser('Alpha');
			const betaId = await createCategoryForUser('Beta');

			await createTransactionForUser(alphaId, {
				amount: 10,
				type: 'EXPENSE',
				description: 'Alpha expense 1',
				date: currentMonthDate(5),
			});
			await createTransactionForUser(alphaId, {
				amount: 10,
				type: 'EXPENSE',
				description: 'Alpha expense 2',
				date: currentMonthDate(6),
			});
			await createTransactionForUser(betaId, {
				amount: 10,
				type: 'EXPENSE',
				description: 'Beta expense 1',
				date: currentMonthDate(7),
			});
			await createTransactionForUser(betaId, {
				amount: 10,
				type: 'EXPENSE',
				description: 'Beta expense 2',
				date: currentMonthDate(8),
			});

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_CATEGORIES_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategoriesSummary).toEqual({
				transactionCount: 4,
				mostUsedCategory: {
					id: alphaId,
					name: 'Alpha',
					transactionCount: 2,
				},
			});
		});

		it('does not include another user transactions', async () => {
			await ctx.createUser({ id: 'user-a', email: 'a@example.com' });
			await ctx.createUser({ id: 'user-b', email: 'b@example.com' });

			const categoryA = await createCategoryForUser('Food', {
				id: 'user-a',
				email: 'a@example.com',
			});
			const categoryB = await createCategoryForUser('Food', {
				id: 'user-b',
				email: 'b@example.com',
			});

			await createTransactionForUser(
				categoryA,
				{
					amount: 40,
					type: 'EXPENSE',
					description: 'User A expense',
					date: currentMonthDate(5),
				},
				{ id: 'user-a', email: 'a@example.com' },
			);
			await createTransactionForUser(
				categoryB,
				{
					amount: 999,
					type: 'EXPENSE',
					description: 'User B expense',
					date: currentMonthDate(5),
				},
				{ id: 'user-b', email: 'b@example.com' },
			);

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader({ id: 'user-a', email: 'a@example.com' }))
				.send({ query: GET_CATEGORIES_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getCategoriesSummary).toEqual({
				transactionCount: 1,
				mostUsedCategory: {
					id: categoryA,
					name: 'Food',
					transactionCount: 1,
				},
			});
		});

		it('rejects getCategoriesSummary when unauthenticated', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: GET_CATEGORIES_SUMMARY });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
		});
	});
});
