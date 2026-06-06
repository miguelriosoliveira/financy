import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

// Load the dedicated test environment so `src/env.ts` validates successfully and
// the app/Prisma point at the throwaway test database instead of the dev one.
const testEnv = dotenv.parse(readFileSync(new URL('./.env.test', import.meta.url)));
Object.assign(process.env, testEnv);

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['src/tests/**', 'src/prisma/generated/**', 'src/env.ts', 'src/server.ts', 'src/**/*.interface.ts'],
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					// Pure, fast tests for business logic and utilities. No database.
					include: ['src/services/**/*.spec.ts', 'src/utils/**/*.spec.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'integration',
					environment: 'node',
					include: ['src/tests/**/*.spec.ts'],
					env: testEnv,
					// Pushes the Prisma schema to the test database before the suite runs.
					globalSetup: './vitest.global-setup.ts',
					// Run integration files sequentially so they don't race on the test DB.
					fileParallelism: false,
				},
			},
		],
	},
});
