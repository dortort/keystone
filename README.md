# Keystone

> AI-assisted software architecture documentation

Keystone is an open-source Electron desktop application that streamlines the creation and maintenance of software architecture documentation through conversational AI. Generate, refine, and maintain **PRDs** (Product Requirements Documents), **TDDs** (Technical Design Documents), and **ADRs** (Architecture Decision Records) with AI assistance.

## Features

- **Multi-threaded AI Conversations**: Maintain parallel conversation threads with full context persistence
- **Side-by-Side Workspace**: Conversations and documents live together in a unified interface
- **Highlight-to-Interact**: Select any document section to inquire or refine
- **ADR Generation**: Automatic architecture decision records when pivoting decisions
- **Provider Agnostic**: Works with OpenAI, Google Gemini, and Anthropic Claude

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Design Document](docs/TDD.md)

---

## Getting Started

### Prerequisites

- **Node.js**
- **pnpm**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/dortort/keystone.git
cd keystone

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Running the App

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

---

## Development Environment

### Recommended Setup

| Tool | Purpose |
|------|---------|
| **VS Code** / **Cursor** | Primary IDE |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript** | Type checking |

### IDE Extensions

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- GitLens

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Optional: API key fallbacks (subscription auth preferred)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

---

## Trunk-Based Development

We follow **trunk-based development** with short-lived feature branches.

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<description>` | `feat/add-adr-generation` |
| Bug fix | `fix/<description>` | `fix/thread-context-loss` |
| Chore | `chore/<description>` | `chore/update-deps` |
| Docs | `docs/<description>` | `docs/api-reference` |
| Refactor | `refactor/<description>` | `refactor/orchestrator` |
| CI/CD | `ci/<description>` | `ci/add-e2e-tests` |

### Workflow

```
main
  │
  ├── feat/add-adr-generation (short-lived, < 2 days)
  │     └── PR → main
  │
  └── fix/thread-context-loss (short-lived)
        └── PR → main
```

1. **Create branch** from `main`: `git checkout -b feat/my-feature`
2. **Commit frequently** with conventional commits
3. **Open PR early** (draft if WIP)
4. **Keep branches short-lived** (< 2 days ideally)
5. **Rebase before merge** to maintain linear history

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat(orchestrator): add decision pivot detection"
git commit -m "fix(ui): resolve thread list scroll issue"
git commit -m "docs: update API reference"
```

---

## GitHub Actions CI/CD

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push, PR to `main` | Lint, type-check, test |
| **Build** | Push to `main` | Build & package for all platforms |
| **Release** | Tag `v*` | Create GitHub release with artifacts |

### CI Pipeline

```yaml
# Runs on every push and pull request
- Checkout code
- Setup Node.js + pnpm
- Install dependencies
- Run linting (ESLint)
- Run type checking (tsc)
- Run unit tests (Vitest)
- Run integration tests
```

### Required Checks

All PRs to `main` must pass:
- ✅ Linting (`pnpm lint`)
- ✅ Type checking (`pnpm typecheck`)
- ✅ Unit tests (`pnpm test`)
- ✅ Build succeeds (`pnpm build`)

### Branch Protection

`main` branch is protected with:
- Require PR reviews (1 minimum)
- Require status checks to pass
- Require linear history (rebase merging)
- No force pushes

---

## Coding Conventions

### TypeScript

- **Strict mode enabled** — No `any` types without justification
- **Prefer interfaces** over type aliases for object shapes
- **Use `readonly`** for immutable properties
- **Explicit return types** for exported functions

```typescript
// ✅ Good
interface ThreadConfig {
  readonly id: string;
  maxMessages: number;
}

export function createThread(config: ThreadConfig): Thread {
  // ...
}

// ❌ Avoid
export const createThread = (config: any) => {
  // ...
}
```

### React Components

- **Functional components** with hooks
- **Named exports** for components
- **Props interface** named `<Component>Props`
- **Colocate** styles, tests, and types

```typescript
// ✅ Good
interface ThreadListProps {
  threads: Thread[];
  onSelect: (id: string) => void;
}

export function ThreadList({ threads, onSelect }: ThreadListProps) {
  return (
    // ...
  );
}
```

### File Structure

```
src/
├── main/                 # Electron main process
│   ├── ipc/              # IPC handlers
│   ├── services/         # Business logic
│   └── index.ts
├── renderer/             # React frontend
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-based modules
│   │   ├── conversation/
│   │   └── document/
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   └── App.tsx
├── shared/               # Shared types and utilities
│   ├── types/
│   └── utils/
└── agents/               # AI agent implementations
    ├── orchestrator/
    └── specialists/
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files (components) | PascalCase | `ThreadList.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Files (types) | PascalCase | `Thread.ts` |
| Interfaces | PascalCase | `ThreadConfig` |
| Functions | camelCase | `createThread` |
| Constants | SCREAMING_SNAKE | `MAX_THREADS` |
| CSS classes | kebab-case | `thread-list-item` |

### Import Order

```typescript
// 1. Built-in Node modules
import path from 'path';

// 2. External packages
import React from 'react';
import { useStore } from 'zustand';

// 3. Internal aliases (@/)
import { Thread } from '@/shared/types';
import { formatDate } from '@/shared/utils';

// 4. Relative imports
import { ThreadItem } from './ThreadItem';
import styles from './ThreadList.module.css';
```

---

## Testing

### Test Stack

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `*.test.ts` colocated |
| Component | Vitest + Testing Library | `*.test.tsx` colocated |
| E2E | Playwright | `e2e/` directory |

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Test Naming

```typescript
describe('ThreadList', () => {
  it('should render all threads', () => {
    // ...
  });

  it('should call onSelect when thread is clicked', () => {
    // ...
  });
});
```

---

## Scripts Reference

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm typecheck    # Run TypeScript type check
pnpm test         # Run unit tests
pnpm test:watch   # Run tests in watch mode
pnpm test:e2e     # Run E2E tests
pnpm format       # Format code with Prettier
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`feat/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to your fork
5. Open a Pull Request

Please ensure your PR:
- Passes all CI checks
- Includes tests for new functionality
- Updates documentation as needed
- Follows the coding conventions above

---

## License

This project is open source. See [LICENSE](LICENSE) for details.
