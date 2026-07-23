# gotcha! — Coding Conventions

## TypeScript
- Use explicit return types for functions that are not obviously typed
- Prefer `interface` over `type` for object shapes
- Props interfaces named `Props` (file-local) or `ComponentNameProps` (exported)
- No `any` unless absolutely necessary; prefer `unknown` or proper types

## React Components
- Functional components only (no class components)
- One component per file, filename matches component name
- Export using `export default function ComponentName()`
- State colocated with the component that uses it (no premature lifting)
- Use `useEffect` for side effects (API calls, navigation redirects)

## File Naming
- Components: `PascalCase.tsx` (e.g. `MissionCard.tsx`)
- Pages: `PascalCasePage.tsx` (e.g. `LoginPage.tsx`)
- Contexts: `PascalCaseContext.tsx` (e.g. `AuthContext.tsx`)
- Utilities: `camelCase.ts` (e.g. `api.ts`)
- Server routes: `camelCase.js` (e.g. `auth.js`)

## CSS
- All styles in `App.css` (single file for now — split when it exceeds ~500 lines)
- CSS custom properties for all colors and spacing
- Class naming: block-based, lowercase with hyphens (e.g. `.mission-card`, `.login-form`)
- No CSS modules or CSS-in-JS unless the project grows significantly
- Mobile-first: design for 375px-414px width, responsive via `max-width` constraints
- Use `px` for border-radius, `px` or `rem` for spacing, `%` for widths

## API Design
- RESTful: resource-based paths (`/api/missions/pool`)
- Responses always JSON with either `{success: true, data}` or `{success: false, message}`
- Server reads/writes JSON files synchronously (file-based storage, simple and fast enough for this use case)

## Git
- Commit messages: imperative, lowercase, concise (e.g. "add mission selector animation")
- Never commit `node_modules/`

## Error Handling
- API calls in `api.ts` return parsed JSON, errors bubble to callers
- Components handle loading/error states with local `useState`
- Server returns human-readable error messages (displayed directly to user)

## Routing
- `react-router-dom` v7 with `<BrowserRouter>`
- Protected routes use the `<ProtectedRoute>` wrapper component
- URL structure: `/` (login), `/missions` (selection), `/wallet` (placeholder)
