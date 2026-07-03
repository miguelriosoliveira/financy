# AGENTS.md

Backend development patterns for AI-assisted work.

## Architecture

Layered architecture: resolver → service → repository → db client. Dependencies are constructor-injected and wired in the app container.

## Testing

Tests use Vitest with separate unit and integration suites. Unit tests isolate services with the typed mock helper; integration tests exercise the app against the test database.

## Validation

Define schemas in the shared package and apply them via the validation middleware in resolvers. Throw domain errors as `GraphQLError` with a shared error code.

## GraphQL schema

The generated GraphQL SDL (`schema.graphql`) is emitted from the resolver metadata. Regenerate it with the dedicated schema script after changing resolvers or GraphQL types; treat the file as generated (don't hand-edit).

## Pagination

Paginated list queries use offset-based pagination (`page` / `pageSize` args, capped page size) returning a page object with `items`, `totalCount`, `page`, and `pageSize`. This supports numbered page navigation with direct jumps in the UI, which cursor-based pagination cannot express.

Always order by a deterministic sort ending in a unique tiebreaker (for transactions: `date desc`, `category name asc`, `id desc`) and always scope by `userId`.

## Imports

Follow the established module import convention.
