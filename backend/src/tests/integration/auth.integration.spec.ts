import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const REGISTER = /* GraphQL */ `
	mutation Register($data: RegisterInput!) {
		register(data: $data) {
			success
		}
	}
`;

const LOGIN = /* GraphQL */ `
	mutation Login($data: LoginInput!) {
		login(data: $data) {
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

	describe('register', () => {
		it('registers a new user and persists it', async () => {
			const data = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' };

			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: REGISTER, variables: { data } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();

			const { register } = response.body.data;
			expect(register.success).toBe(true);

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

		it.each([
			{
				label: 'empty name',
				data: { name: '', email: 'ada@example.com', password: 'secret123' },
				field: 'name',
			},
			{
				label: 'invalid email',
				data: { name: 'Ada Lovelace', email: 'not-an-email', password: 'secret123' },
				field: 'email',
			},
			{
				label: 'short password',
				data: { name: 'Ada Lovelace', email: 'ada@example.com', password: 'short' },
				field: 'password',
			},
		])('rejects registration with $label', async ({ data, field }) => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: REGISTER, variables: { data } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.[field]).toBeDefined();
			expect(response.body.data).toBeNull();

			const stored = await ctx.dbClient.findByEmail(data.email);
			expect(stored).toBeNull();
		});
	});

	describe('login', () => {
		it('logs in successfully with valid credentials', async () => {
			const registerData = {
				name: 'Ada Lovelace',
				email: 'ada@example.com',
				password: 'secret123',
			};

			const registerResponse = await request(ctx.app)
				.post('/graphql')
				.send({ query: REGISTER, variables: { data: registerData } });
			expect(registerResponse.body.errors).toBeUndefined();

			const response = await request(ctx.app)
				.post('/graphql')
				.send({
					query: LOGIN,
					variables: { data: { email: registerData.email, password: registerData.password } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();

			const { login } = response.body.data;
			expect(login.token).toEqual(expect.any(String));
			expect(login.refreshToken).toEqual(expect.any(String));
			expect(login.user).toMatchObject({ email: registerData.email });
			expect(login.user.id).toEqual(expect.any(String));
		});

		it('rejects login with a wrong password', async () => {
			const registerData = {
				name: 'Grace Hopper',
				email: 'grace@example.com',
				password: 'secret123',
			};

			const registerResponse = await request(ctx.app)
				.post('/graphql')
				.send({ query: REGISTER, variables: { data: registerData } });
			expect(registerResponse.body.errors).toBeUndefined();

			const response = await request(ctx.app)
				.post('/graphql')
				.send({
					query: LOGIN,
					variables: { data: { email: registerData.email, password: 'wrong-password' } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Invalid credentials');
			expect(response.body.data).toBeNull();
		});

		it('rejects login for a non-existent email', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({
					query: LOGIN,
					variables: { data: { email: 'missing@example.com', password: 'secret123' } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Invalid credentials');
			expect(response.body.data).toBeNull();
		});

		it.each([
			{
				label: 'invalid email',
				data: { email: 'not-an-email', password: 'secret123' },
				field: 'email',
			},
			{
				label: 'short password',
				data: { email: 'ada@example.com', password: 'short' },
				field: 'password',
			},
		])('rejects login with $label', async ({ data, field }) => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({ query: LOGIN, variables: { data } });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.errors[0].extensions?.issues?.[field]).toBeDefined();
			expect(response.body.data).toBeNull();
		});
	});
});
