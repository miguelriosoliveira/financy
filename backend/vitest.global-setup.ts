import { execSync } from 'node:child_process';
import { env } from 'node:process';

export function setup() {
	// DATABASE_URL is provided by vitest.config.ts (loaded from .env.test); fall
	// back to a local file so the suite never targets a real database by accident.
	if (!env.DATABASE_URL) {
		env.DATABASE_URL = 'file:./test.db';
	}
	console.log(`\n📦 Pushing Prisma schema to test database: ${env.DATABASE_URL}...\n`);
	execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
}

export function teardown() {
	console.log('\n🧹 Integration tests complete. Test database retained for debugging.\n');
}
