# Keystone AI Agent Instructions

## Project Overview

Keystone is an Electron desktop app for AI-assisted software architecture documentation. Built with React 19, TypeScript 5.7, Tailwind 3.4, electron-vite 5, Zustand 5, better-sqlite3 11, and tRPC 10.

## Architecture

- `src/main/` - Electron main process (services, database, IPC)
- `src/renderer/` - React UI (components, features, stores)
- `src/agents/` - AI orchestration (providers, specialists, orchestrator)
- `src/shared/` - Types, utilities, constants
- `src/preload/` - Electron preload scripts

## Development Workflow

### Commit and Push Regularly

- Commit changes in logical units of work
- Push frequently to keep remote in sync
- Use conventional commit format: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

### Branch Strategy

- Main branch is protected; changes require pull requests
- Create feature branches: `feat/<description>`, `fix/<description>`
- Use squash merge for clean history

### Auto-Merge When Work is Completed

- When a feature is complete and tested, merge the PR immediately
- Use `gh pr merge --squash --auto` for auto-merge with squash
- Don't leave PRs open unnecessarily

### Before Committing

1. Run `pnpm typecheck` to verify types
2. Run `pnpm lint` to check for linting issues
3. Run `pnpm test` for unit tests (if applicable)

## Key Technical Notes

### electron-vite Configuration

- electron-vite v5.0.0+ required for Vite 7 compatibility
- `tsconfig.web.json` must include `src/main/**/*` and `src/agents/**/*` because renderer imports `AppRouter` type

### OAuth Authentication

- OpenAI OAuth requires fixed port 1455 and callback path `/auth/callback`
- Anthropic does NOT support OAuth (API keys only, per TOS)
- Google OAuth is experimental (access may be revoked)

### tRPC Context

- `createContext()` must be async (`Promise<Context>`)
- Services are instantiated once and cached in `_context`
