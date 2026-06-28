import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const PRISMA_PATH = './src/db/prisma';

export default defineConfig({
	schema: `${PRISMA_PATH}/schema.prisma`,
	migrations: { path: `${PRISMA_PATH}/migrations` },
	datasource: { url: process.env.DATABASE_URL },
});
