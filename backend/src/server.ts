import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ERROR_CODES } from '@financy/shared';
import cors from 'cors';
import express from 'express';
import { GraphQLError } from 'graphql';
import { buildSchema } from 'type-graphql';
import { createAppContainer } from './container.ts';
import { buildContext, type GraphQLContext } from './context.ts';
import { env } from './env.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { CategoryResolver } from './resolvers/category.resolver.ts';
import { HealthResolver } from './resolvers/health.resolver.ts';

const isTest = process.env.NODE_ENV === 'test';

export async function initServer() {
	const { container, dbClient, jwtService } = createAppContainer();
	await dbClient.connect();
	const app = express();
	const server = new ApolloServer<GraphQLContext>({
		schema: await buildSchema({
			resolvers: [AuthResolver, HealthResolver, CategoryResolver],
			validate: false,
			// Avoid rewriting the committed schema file during test runs.
			emitSchemaFile: isTest ? false : './schema.graphql',
			container,
			authChecker: ({ context }) => {
				if (!context.user) {
					throw new GraphQLError('Unauthorized', {
						extensions: { code: ERROR_CODES.UNAUTHENTICATED },
					});
				}
				return true;
			},
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
