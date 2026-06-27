import type { Express } from 'express';
import type { PrismaDbClient } from '../../db/prisma-db-client.ts';
import { initServer } from '../../server.ts';
import type { JwtPayload, JwtService } from '../../services/jwt.service.ts';

export interface TestApp {
	app: Express;
	dbClient: PrismaDbClient;
	jwtService: JwtService;
	/** Returns a valid Authorization header for an authenticated test user. */
	authHeader: (overrides?: Partial<JwtPayload>) => string;
	/** Wipes every table so each test starts from a clean slate. */
	clean: () => Promise<void>;
	/** Closes the database connection. Call from `afterAll`. */
	close: () => Promise<void>;
}

export async function setupTestApp(): Promise<TestApp> {
	const { app, dbClient, jwtService } = await initServer();

	function authHeader(overrides?: Partial<JwtPayload>): string {
		const token = jwtService.sign({
			id: 'test-user-id',
			email: 'test@example.com',
			...overrides,
		});
		return `Bearer ${token}`;
	}

	async function clean() {
		// Delete in FK-safe order (transactions reference users and categories).
		await dbClient.client.transaction.deleteMany();
		await dbClient.client.user.deleteMany();
		await dbClient.client.category.deleteMany();
	}

	async function close() {
		await dbClient.disconnect();
	}

	return { app, dbClient, jwtService, authHeader, clean, close };
}
