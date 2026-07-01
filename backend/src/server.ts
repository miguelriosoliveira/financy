import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import { createAppContainer } from './container.ts';
import { buildContext, type GraphQLContext } from './context.ts';
import { env } from './env.ts';
import { buildAppSchema } from './schema.ts';

const isTest = process.env.NODE_ENV === 'test';

export async function initServer() {
	const { container, dbClient, jwtService } = createAppContainer();
	await dbClient.connect();
	const app = express();
	const server = new ApolloServer<GraphQLContext>({
		schema: await buildAppSchema({
			emitSchemaFile: isTest ? false : './schema.graphql', // Avoid rewriting the schema file during test runs
			container,
		}),
	});
	await server.start();

	app.use(
		'/graphql',
		cors(),
		express.json(),
		expressMiddleware(server, { context: buildContext(jwtService) }),
	);

	return { app, dbClient, jwtService };
}

if (!isTest) {
	const { app } = await initServer();
	app.listen(env.PORT, () =>
		console.log(`🚀 Server ready at: http://localhost:${env.PORT}/graphql`),
	);
}
