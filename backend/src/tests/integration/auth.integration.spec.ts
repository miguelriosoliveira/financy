import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const REGISTER = /* GraphQL */ `
	mutation Register($data: RegisterInput!) {
		register(data: $data) {
			token
			refreshToken
			user {
				id
				name
				email
			}
		}
	}
`;

describe('Auth (integration)', () => {
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

	it('registers a new user and persists it', async () => {
		const data = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' };

		const response = await request(ctx.app)
			.post('/graphql')
			.send({ query: REGISTER, variables: { data } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();

		const { register } = response.body.data;
		expect(register.token).toEqual(expect.any(String));
		expect(register.refreshToken).toEqual(expect.any(String));
		expect(register.user).toMatchObject({ name: data.name, email: data.email });
		expect(register.user.id).toEqual(expect.any(String));

		const stored = await ctx.dbClient.findByEmail(data.email);
		expect(stored).not.toBeNull();
		expect(stored?.name).toBe(data.name);
		expect(stored?.password).not.toBe(data.password);
	});

	it('rejects registering the same email twice', async () => {
		const data = { name: 'Grace Hopper', email: 'grace@example.com', password: 'secret123' };

		const first = await request(ctx.app)
			.post('/graphql')
			.send({ query: REGISTER, variables: { data } });
		expect(first.body.errors).toBeUndefined();

		const second = await request(ctx.app)
			.post('/graphql')
			.send({ query: REGISTER, variables: { data } });

		expect(second.body.errors).toBeDefined();
		expect(second.body.errors[0].message).toBe('User already registered');

		const all = await ctx.dbClient.client.user.findMany({ where: { email: data.email } });
		expect(all).toHaveLength(1);
	});
});
