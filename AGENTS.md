# Agents guide for this repository

## Purpose

This file helps AI agents (and humans) quickly understand the project's stack, folder layout, conventions, and safe operating boundaries so automated changes are useful and low-risk.

## Key references

- Project manifest: [package.json](package.json)
- App entry / routing: [app/layout.tsx](app/layout.tsx#L1)

## Summary of stack (from package.json)

- Framework: Next.js 16 (App Router)
- UI: React 19 + TypeScript
- Styling: TailwindCSS (v4 tooling) + @tailwindcss/postcss
- State: Zustand
- Animations: framer-motion
- HTTP: axios
- Payments: stripe (stripe + @stripe/stripe-js)
- Utilities: clsx, js-cookie, crypto-js, swiper, sonner
- icons : react-icons

## Important folders (high-level)

- `app/` — Next.js App Router pages and components. Primary working area for routes and UI.
  - `_components/` — shared components grouped by purpose (auth, \_global, \_website). Good first place for UI changes.
  - `(pathes)/` — route-level folders (blog, cart, products, shop, verify-email, etc.). Edit here for page-level changes.
  - `api/` — edge/server routes (e.g., `checkout/route.ts`). Server-side logic and webhooks live here.
- `helpers/`, `hooks/`, `context/`, `store/`, `types/` — cross-cutting code; agents should prefer these layers for shared logic changes.

# File Structure Guide

## Architecture Style

This project uses a lightweight feature-first structure.

Goal:

- keep logic organized
- reduce scattered files
- improve maintainability
- make features portable
- avoid over-engineering

---

# Main Rule

Each feature should own its files.

Example:

```txt
src/modules/auth/
src/modules/cart/
src/modules/products/
src/modules/checkout/
```

Avoid spreading feature logic across:

```txt
helpers/
hooks/
store/
types/
```

globally.

---

# Recommended Structure

Example:

```txt
src/modules/auth/
│
├── api/
│   ├── auth.api.ts
│   ├── auth.client.ts
│   └── auth.endpoints.ts
│
├── hooks/
│   ├── useAuth.hook.ts
│   ├── useLogin.hook.ts
│   ├── useLogout.hook.ts
│   └── useSession.hook.ts
│
├── services/
│   ├── auth.service.ts
│   └── auth.session.service.ts
│
├── store/
│   └── auth.store.ts
│
├── constants/
│   ├── auth.constants.ts
│   ├── auth.errors.ts
│   ├── auth.keys.ts
│   └── auth.routes.ts
│
├── types/
│   └── auth.types.ts
│
├── config/
│   └── auth.config.ts
│
└── index.ts
```

---

# Naming Convention

Use descriptive nested names.

Preferred:

```txt
auth.api.ts
auth.store.ts
auth.service.ts
auth.types.ts
useAuth.hook.ts
useLogin.hook.ts
product-card.component.tsx
checkout-form.component.tsx
```

Avoid:

```txt
utils.ts
helpers.ts
types.ts
store.ts
service.ts
hook.ts
```

---

# Folder Responsibilities

## api/

Raw HTTP requests only.

Example:

```txt
loginApi()
logoutApi()
getProductsApi()
```

---

## hooks/

React hooks only.

Example:

```txt
useAuth()
useCart()
useProducts()
```

---

## services/

Business/orchestration logic.

Example:

```txt
handleLogin()
initializeSession()
handleCheckout()
```

---

## store/

Zustand state only.

Example:

```txt
user
cartItems
loading states
setters
```

---

## constants/

Static values.

Example:

```txt
routes
query keys
error messages
```

---

## types/

Feature types/interfaces/enums.

---

## config/

Feature configuration.

Example:

```txt
auth.config.ts
checkout.config.ts
```

---

# Dependency Flow

Preferred flow:

```txt
Component
→ Hook
→ Service
→ API
→ Backend
```

Avoid:

```txt
Component → API directly
Store → API directly
```

---

# Global Folders

Use global folders ONLY for truly shared logic.

Example:

```txt
src/shared/
src/lib/
src/components/ui/
```

Do not place feature business logic globally.

---

# Important Rules

- Keep features isolated.
- Avoid unnecessary abstractions.
- Avoid deep nesting.
- Keep stores lightweight.
- Keep API logic outside components.
- Prefer explicit file names.
- Keep business logic outside UI.
- Avoid duplicated logic.
- Keep architecture simple and scalable.

## Conventions and assumptions for agents

- App Router is in use: prefer editing route folders under `app/` over legacy `pages/`.
- Components may be server or client: look for `"use client"` at the top of files before converting or moving components.
- Keep changes minimal and localized: modify the smallest set of files that accomplish the task.
- Respect secrets and environment variables: never add or expose API keys, secrets, or .env values in commits.

## Recommended agent responsibilities

- Create, refactor, or document UI components under `app/_components/`.
- Add or update API route handlers under `app/api/` and keep server logic isolated.
- Update shared helpers in `helpers/` and `hooks/` rather than duplicating logic across pages.
- Suggest or implement TypeScript type improvements in `types/` and ensure narrow, focused changes.

## Examples of useful prompts for agents

- "Refactor the product list to use a shared `ProductCard` component in `app/_components/_website/_products`."
- "Add server-side validation to `app/api/checkout/route.ts` to verify payload and return descriptive errors."

## Safe edits and guardrails

- Do not run installs or CI-affecting commands without explicit approval from the developer.
- Do not commit secrets or change `.gitignore` to expose private data.
- When changing package versions, propose the upgrade in a single commit and request human review — run `pnpm install` only after confirmation.

## Dev commands (recommended)

- Run locally: `pnpm dev` (project has a pnpm lockfile; prefer pnpm)
- Build: `pnpm build`
- Start production: `pnpm start`
- Lint: `pnpm lint`

## Notes for maintainers and agents

- Focus automated suggestions on user-visible behavior, accessibility, and performance improvements.
- When proposing dependency upgrades, include compatibility notes for Next.js 16 and React 19.
- If a change touches both client and server (e.g., checkout flow), include an integration test plan or manual verification steps.

## Where to look first

- UI changes: `app/_components/` and route folders under `app/(pathes)/`.
- Routing and page structure: top-level folders in `app/`.
- Server logic / APIs: `app/api/` and `helpers/handleCheckout.tsx`.

## If you are an agent: how to use this file

1. Read the Stack and Important folders sections.
2. Open the small set of files relevant to the requested task (prefer localized diffs).
3. Respect guardrails above; propose dependency or infra changes as PRs with human review.

## Contact / escalation

If unsure about dataflows, payments, or secrets, add a comment in the PR and tag the repo owner for review.

--
This `AGENTS.md` is intentionally concise. For deeper work, request permission to run build/lint locally and include test instructions.
