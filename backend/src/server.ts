import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { env } from './env.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { UserResolver } from './resolvers/user.resolver.ts';

const app = express();
const server = new ApolloServer({
	schema: await buildSchema({
		resolvers: [AuthResolver, UserResolver],
		validate: false,
		emitSchemaFile: './schema.graphql',
	}),
});
await server.start();

app.use('/graphql', cors(), express.json(), expressMiddleware(server));

app.listen(env.PORT, () => console.log(`🚀 Server ready at: http://localhost:${env.PORT}/graphql`));
