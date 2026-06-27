import type { JwtPayload, JwtService } from './services/jwt.service.ts';

export type GraphQLContext = {
	user: JwtPayload | null;
};

function extractBearerToken(authorization: string | undefined): string | null {
	if (!authorization?.startsWith('Bearer ')) {
		return null;
	}
	const token = authorization.slice('Bearer '.length).trim();
	return token.length > 0 ? token : null;
}

type ContextRequest = {
	req: {
		headers: {
			authorization?: string;
		};
	};
};

export function buildContext(jwtService: JwtService) {
	return async ({ req }: ContextRequest): Promise<GraphQLContext> => {
		const token = extractBearerToken(req.headers.authorization);
		const user = token ? jwtService.verify(token) : null;
		return { user };
	};
}
