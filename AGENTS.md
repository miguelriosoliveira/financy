# AGENTS.md

Development patterns for AI-assisted work in this monorepo.

## Package manager

This project uses pnpm. Never use npm or yarn. Use pnpm script shortcuts and workspace filters (e.g. `pnpm t`, `pnpm lint`, `pnpm --filter backend <script>`).

## After each development slice

Run these commands and ensure they all pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Test-first

Write tests before implementing the code they cover.

## Formatting and linting

Biome owns formatting and linting. Don't hand-format; let `pnpm lint` fix it.

## Generated and vendored code

Don't edit generated or vendored code (e.g. shadcn UI components, Prisma-generated client, the generated GraphQL schema).

## Package-specific rules

See `frontend/AGENTS.md` and `backend/AGENTS.md`.
