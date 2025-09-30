# Repository Guidelines

## Project Structure & Module Organization
Routing lives in `app/` using the Next.js App Router; `app/page.tsx` drives the WhatsApp bulk messaging flow and `app/api/` hosts edge handlers. Shared UI building blocks sit in `components/` (see `components/ui/` for Radix wrappers), reusable logic belongs in `hooks/`, and cross-cutting helpers reside in `lib/`. Styling is centralized in `styles/`, while static files and integration assets belong in `public/`. Generated directories such as `.next/` and temporary uploads must stay untracked.

## Build, Test, and Development Commands
- `pnpm install` - resolve dependencies against `pnpm-lock.yaml`.
- `pnpm dev` - launch the local Next.js server for iterative work.
- `pnpm build` - compile the production bundle; run it before every release branch merge.
- `pnpm start` - serve the built output to mimic the hosting environment.
- `pnpm lint` - execute the Next.js ESLint preset; fix issues or add justifying comments.

## Coding Style & Naming Conventions
Author TypeScript modules with the strict settings defined in `tsconfig.json`. Use two-space indentation, camelCase for variables and functions, PascalCase for React components, and SCREAMING_SNAKE_CASE for environment keys. Prefer the `@/` alias to deep relative paths and keep component props strongly typed. Compose Tailwind utilities in the order layout -> spacing -> color, and extract repeated patterns into `components/ui/` before reuse.

## Testing Guidelines
An automated suite is not yet in place; prioritize adding React Testing Library specs under `components/__tests__/` and API route checks beside the handlers in `app/api/**/__tests__/`. Until coverage exists, perform smoke tests manually (`pnpm dev`, sample CSV upload, message send) and record outcomes in the PR body. Aim for high-confidence paths first, then backfill regression tests when introducing complex logic.

## Commit & Pull Request Guidelines
Follow the existing short-prefix style (`add:`, `fix:`, `chore:`) plus a concise action, for example `fix: guard empty recipients`. Keep commits focused and rebased on main. Every PR should describe the problem, outline the solution, include screenshots or clips for UI tweaks, link related issues, and list the commands executed (`pnpm lint`, `pnpm build`). Request review only when checks pass locally.

## Environment & Security Notes
Secrets belong in `.env.local`; share reference values through `.env.example`. Point development calls at sandbox or throttled WhatsApp endpoints to avoid bans, and never commit real tokens, CSVs with personal data, or `.next/` artifacts. Rotate credentials if they leak or when contributors offboard.
