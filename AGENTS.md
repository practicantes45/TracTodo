# Repository Guidelines

## Project Structure & Module Organization
- `backend/` contains the Express API (`server.js`) plus Firebase admin helpers in `src/` and maintenance scripts (e.g., `createAdminAuth.js`, `migrateUsers.js`).
- Secrets load from `backend/.env`; keep only local overrides and rely on Railway variables in production.
- `frontend/` hosts the Next.js 15 app router. Routes live under `src/app` (Spanish slugs like `productos/` and `entretenimiento/`), shared UI under `src/app/components`, hooks under `src/hooks`, services in `src/services`, and utilities in `src/utils`.
- Place static images and SEO assets in `frontend/public`; generated folders such as `.next/` and `node_modules/` must stay untracked.

## Build, Test, and Development Commands
- Install dependencies once per package: `cd backend && npm install`, `cd frontend && npm install`.
- Backend: `npm run dev` starts nodemon, `npm start` runs the API on `0.0.0.0:${PORT}`, and `npm run build` triggers the lightweight production check.
- Frontend: `npm run dev` serves the client on `http://localhost:3001`, `npm run build` validates production output, and `npm run lint` runs ESLint's Next.js rules.

## Coding Style & Naming Conventions
- Backend sticks to CommonJS, 2-space indentation, and double-quoted imports. Reuse the Firebase config in `src/config/firebase.js` rather than instantiating admin clients ad hoc.
- Frontend components are JSX modules; keep component folders PascalCase inside `src/app/components`, keep route folders lowercase Spanish nouns, and use camelCase for hooks/services.
- Run `npm run lint` before pushing; Tailwind utility chains should stay readable (group layout > spacing > color).

## Testing Guidelines
- `backend/npm test` currently exits with an error placeholder; add Jest or integration scripts before enabling CI and document any new commands.
- When adding frontend tests, colocate them near the feature (e.g., `src/app/blog/__tests__/page.test.tsx`) and ensure they pass linting.
- Record manual QA steps in PRs for flows touching Firebase read/write or public marketing pages.

## Commit & Pull Request Guidelines
- Use imperative commit subjects and prefer Conventional Commit prefixes (`feat(navbar): improve menu overlay`). Avoid "repo resubido" style summaries.
- Reference issues or tasks and note environment impacts (e.g., new env vars).
- Pull requests should include a concise summary, screenshots for UI updates, manual verification notes, and any required deployment URLs.
