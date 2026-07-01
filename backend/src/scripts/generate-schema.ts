import 'reflect-metadata';
import { buildAppSchema } from '../schema.ts';

await buildAppSchema({ emitSchemaFile: './schema.graphql' });
