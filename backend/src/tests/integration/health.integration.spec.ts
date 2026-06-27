import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupTestApp, type TestApp } from '../helpers/test-app.ts';

const HEALTH = /* GraphQL */ `
	query Health {
		health
	}
`;

describe('Health (integration)', () => {
	let ctx: TestApp;

	beforeAll(async () => {
		ctx = await setupTestApp();
	});

	afterAll(async () => {
		await ctx.close();
	});

	it('returns ok', async () => {
		const response = await request(ctx.app).post('/graphql').send({ query: HEALTH });

		expect(response.status).toBe(200);
		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.health).toBe('ok');
	});
});
