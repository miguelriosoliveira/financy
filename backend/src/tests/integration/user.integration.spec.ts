import { ERROR_CODES } from '@financy/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const GET_ME = /* GraphQL */ `
	query GetMe {
		getMe {
			id
			name
			email
		}
	}
`;

const UPDATE_PROFILE = /* GraphQL */ `
	mutation UpdateProfile($data: UpdateProfileInput!) {
		updateProfile(data: $data) {
			id
			name
			email
		}
	}
`;

describe('User profile (integration)', () => {
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

	describe('getMe', () => {
		it('returns the authenticated user profile', async () => {
			await ctx.createUser({ name: 'Conta teste', email: 'conta@teste.com' });

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({ query: GET_ME });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.getMe).toEqual({
				id: 'test-user-id',
				name: 'Conta teste',
				email: 'conta@teste.com',
			});
		});

		it('rejects unauthenticated requests', async () => {
			const response = await request(ctx.app).post('/graphql').send({ query: GET_ME });

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});
	});

	describe('updateProfile', () => {
		it('updates the authenticated user name', async () => {
			await ctx.createUser({ name: 'Conta teste', email: 'conta@teste.com' });

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: UPDATE_PROFILE,
					variables: { data: { name: 'Novo nome' } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.updateProfile).toEqual({
				id: 'test-user-id',
				name: 'Novo nome',
				email: 'conta@teste.com',
			});

			const stored = await ctx.dbClient.user.findById('test-user-id');
			expect(stored?.name).toBe('Novo nome');
		});

		it('rejects unauthenticated requests', async () => {
			const response = await request(ctx.app)
				.post('/graphql')
				.send({
					query: UPDATE_PROFILE,
					variables: { data: { name: 'Novo nome' } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].extensions?.code).toBe(ERROR_CODES.UNAUTHENTICATED);
			expect(response.body.data).toBeNull();
		});

		it('rejects empty name', async () => {
			await ctx.createUser();

			const response = await request(ctx.app)
				.post('/graphql')
				.set('Authorization', ctx.authHeader())
				.send({
					query: UPDATE_PROFILE,
					variables: { data: { name: '' } },
				});

			expect(response.status).toBe(200);
			expect(response.body.errors).toBeDefined();
			expect(response.body.errors[0].message).toBe('Validation failed');
			expect(response.body.errors[0].extensions?.code).toBe('BAD_USER_INPUT');
			expect(response.body.data).toBeNull();
		});
	});
});
