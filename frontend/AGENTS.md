# AGENTS.md

Frontend development patterns for AI-assisted work.

## Testing

Tests use Vitest and Testing Library. Render components through the shared test provider helper rather than calling `render` directly, and mock GraphQL through Apollo's testing utilities.

## Locating elements in tests

Prefer accessibility-first queries (`getByRole`, `getByLabelText`). Don't couple tests to volatile user-facing copy (i18n or product wording). When an element's only stable handle would be display text, add a `data-testid` and query by that instead of the literal string.

## Imports

Import from `src` via the configured path alias.
