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

const GET_USER = /* GraphQL */ `
	query GetUser($id: String!) {
		getUser(id: $id) {
			id
			name
			email
		}
	}
`;

describe('User (integration)', () => {
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

	it('fetches a previously registered user by id', async () => {
		const data = { name: 'Alan Turing', email: 'alan@example.com', password: 'enigma42' };

		const registerResponse = await request(ctx.app)
			.post('/graphql')
			.send({ query: REGISTER, variables: { data } });
		expect(registerResponse.body.errors).toBeUndefined();
		expect(registerResponse.body.data.register.success).toBe(true);

		const stored = await ctx.dbClient.user.findByEmail(data.email);
		expect(stored).not.toBeNull();
		// biome-ignore lint/style/noNonNullAssertion: id is guaranteed to be defined here
		const userId = stored!.id;

		const response = await request(ctx.app)
			.post('/graphql')
			.send({ query: GET_USER, variables: { id: userId } });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.getUser).toMatchObject({
			id: userId,
			name: data.name,
			email: data.email,
		});
	});

	it('returns an error when the user does not exist', async () => {
		const response = await request(ctx.app)
			.post('/graphql')
			.send({ query: GET_USER, variables: { id: 'non-existent-id' } });

		expect(response.body.errors).toBeDefined();
		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('User not found');
	});
});
