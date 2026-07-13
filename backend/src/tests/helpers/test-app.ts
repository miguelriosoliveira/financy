import type { Express } from 'express';
import type { PrismaDbClient } from '../../db/prisma-db-client.ts';
import { initServer } from '../../server.ts';
import type { JwtPayload, JwtService } from '../../services/jwt.service.ts';

export interface TestUserOverrides {
	id?: string;
	email?: string;
	name?: string;
	password?: string;
}

export interface TestApp {
	app: Express;
	dbClient: PrismaDbClient;
	jwtService: JwtService;
	/** Returns a valid Authorization header for an authenticated test user. */
	authHeader: (overrides?: Partial<JwtPayload>) => string;
	/** Inserts a user row so category FKs resolve. Defaults match authHeader(). */
	createUser: (overrides?: TestUserOverrides) => Promise<{ id: string; email: string }>;
	/** Wipes every table so each test starts from a clean slate. */
	clean: () => Promise<void>;
	/** Closes the database connection. Call from `afterAll`. */
	close: () => Promise<void>;
}

export async function setupTestApp(): Promise<TestApp> {
	const { app, dbClient, jwtService } = await initServer();

	function authHeader(overrides?: Partial<JwtPayload>): string {
		const token = jwtService.signAccessToken({
			id: 'test-user-id',
			email: 'test@example.com',
			...overrides,
		});
		return `Bearer ${token}`;
	}

	async function createUser(overrides: TestUserOverrides = {}) {
		const id = overrides.id ?? 'test-user-id';
		const email = overrides.email ?? 'test@example.com';
		await dbClient.client.user.create({
			data: {
				id,
				name: overrides.name ?? 'Test User',
				email,
				password: overrides.password ?? 'hashed-password',
			},
		});
		return { id, email };
	}

	async function clean() {
		// Delete in FK-safe order (categories reference users).
		await dbClient.client.transaction.deleteMany();
		await dbClient.client.category.deleteMany();
		await dbClient.client.user.deleteMany();
	}

	async function close() {
		await dbClient.disconnect();
	}

	return { app, dbClient, jwtService, authHeader, createUser, clean, close };
}
