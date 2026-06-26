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
		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.createCategory).toMatchObject(data);
		expect(response.body.data.createCategory.id).toEqual(expect.any(String));

		const stored = await ctx.dbClient.category.findByName(data.name);
		expect(stored).not.toBeNull();
		expect(stored).toMatchObject(data);
	});

	it('creates a category without a description', async () => {
		const data = {
			name: 'Transport',
			icon: 'car',
			color: '#0000ff',
		};

		const response = await request(ctx.app)
			.post('/graphql')
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

	it('rejects creating a category with a duplicate name', async () => {
		const data = {
			name: 'Food',
			description: 'Groceries and dining',
			icon: 'utensils',
			color: '#ff0000',
		};

		const first = await request(ctx.app)
			.post('/graphql')
			.send({ query: CREATE_CATEGORY, variables: { data } });
		expect(first.body.errors).toBeUndefined();

		const second = await request(ctx.app)
			.post('/graphql')
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(second.body.errors).toBeDefined();
		expect(second.body.errors[0].message).toBe('Category already exists');
		expect(second.body.errors[0].extensions?.code).toBe('CATEGORY_ALREADY_EXISTS');

		const all = await ctx.dbClient.client.category.findMany({ where: { name: data.name } });
		expect(all).toHaveLength(1);
	});

	it('rejects creating a category with an empty name', async () => {
		const data = {
			name: '',
			description: 'Invalid category',
			icon: 'utensils',
			color: '#ff0000',
		};

		const response = await request(ctx.app)
			.post('/graphql')
			.send({ query: CREATE_CATEGORY, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeDefined();
		expect(response.body.errors[0].message).toBe('Validation failed');
		expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
		expect(response.body.errors[0].extensions?.issues?.name).toBeDefined();
		expect(response.body.data).toBeNull();

		const stored = await ctx.dbClient.category.findByName(data.name);
		expect(stored).toBeNull();
	});
});
