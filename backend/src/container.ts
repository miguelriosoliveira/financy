import { PrismaDbClient } from './db/prisma-db-client.ts';
import { DbCategoryRepository } from './repositories/category.repository.ts';
import { DbUserRepository } from './repositories/user.repository.ts';
import { AuthResolver } from './resolvers/auth.resolver.ts';
import { CategoryResolver } from './resolvers/category.resolver.ts';
import { UserResolver } from './resolvers/user.resolver.ts';
import { AuthService } from './services/auth.service.ts';
import { CategoryService } from './services/category.service.ts';
import { HashService } from './services/hash.service.ts';
import { JwtService } from './services/jwt.service.ts';
import { UserService } from './services/user.service.ts';

/**
 * type-graphql instantiates resolvers through a container. Since the resolvers
 * declare constructor dependencies, we need to provide a container that returns
 * fully-wired instances, otherwise the services would be `undefined` at runtime.
 */
interface ResolverContainer {
	get(someClass: new (...args: never[]) => unknown): unknown;
}

export interface AppContainer {
	container: ResolverContainer;
	dbClient: PrismaDbClient;
}

export function createAppContainer(): AppContainer {
	const dbClient = new PrismaDbClient();
	const userRepository = new DbUserRepository(dbClient);
	const categoryRepository = new DbCategoryRepository(dbClient);
	const hashService = new HashService();
	const jwtService = new JwtService();
	const authService = new AuthService(userRepository, hashService, jwtService);
	const userService = new UserService(userRepository);
	const categoryService = new CategoryService(categoryRepository);

	const instances = new Map<unknown, unknown>([
		[AuthResolver, new AuthResolver(authService)],
		[UserResolver, new UserResolver(userService)],
		[CategoryResolver, new CategoryResolver(categoryService)],
	]);

	const container: ResolverContainer = {
		get(someClass) {
			const instance = instances.get(someClass);
			if (!instance) {
				throw new Error(`No provider registered for ${someClass.name}`);
			}
			return instance;
		},
	};

	return { container, dbClient };
}
