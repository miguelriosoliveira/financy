import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { createAppContainer } from './container.ts';
import { env } from './env.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { CategoryResolver } from './resolvers/category.resolver.ts';
import { UserResolver } from './resolvers/user.resolver.ts';

const isTest = process.env.NODE_ENV === 'test';

export async function initServer() {
	const { container, dbClient } = createAppContainer();
	const app = express();
	const server = new ApolloServer({
		schema: await buildSchema({
			resolvers: [AuthResolver, UserResolver, CategoryResolver],
			validate: false,
			// Avoid rewriting the committed schema file during test runs.
			emitSchemaFile: isTest ? false : './schema.graphql',
			container,
		}),
	});
	await server.start();

	app.use('/graphql', cors(), express.json(), expressMiddleware(server));

	return { app, dbClient };
}

if (!isTest) {
	const { app } = await initServer();
	app.listen(env.PORT, () =>
		console.log(`🚀 Server ready at: http://localhost:${env.PORT}/graphql`),
	);
}
