import path from 'node:path';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		// Node 25+ exposes native storage globals that prevent Vitest from installing
		// jsdom's browser storage, leaving localStorage undefined in tests. Disable
		// Node's Web Storage in test workers so jsdom provides both storage APIs.
		execArgv: ['--no-experimental-webstorage'],
		setupFiles: ['./src/tests/setup.ts'],
		env: loadEnv(mode, __dirname, 'VITE_'),
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**'],
			exclude: ['src/components/ui/**', 'src/main.tsx', 'src/env.ts', 'src/tests/**'],
		},
	},
}));
