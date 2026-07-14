# AGENTS.md

Frontend development patterns for AI-assisted work.

## shadcn UI components

`src/components/ui/` is managed by shadcn installs. Do not edit by hand.

When different defaults or behavior are needed, create or extend a wrapper in `src/components/` (e.g. `button.tsx` wraps `ui/button.tsx`). App code imports the wrapper, not the raw `ui/` primitive.

## Testing

Tests use Vitest and Testing Library. Render components through the shared test provider helper rather than calling `render` directly, and mock GraphQL through Apollo's testing utilities.

## Locating elements in tests

Prefer accessibility-first queries (`getByRole`, `getByLabelText`). Don't couple tests to volatile user-facing copy (i18n or product wording). When an element's only stable handle would be display text, add a `data-testid` and query by that instead of the literal string.

## Imports

Import from `src` via the configured path alias.
