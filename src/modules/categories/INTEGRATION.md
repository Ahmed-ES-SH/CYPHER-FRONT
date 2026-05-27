# Categories Module — Integration Checklist

> **Target app:** Any Next.js 16+ (App Router) project
> **Module path:** `src/modules/categories/`

## Copy the module

Copy the entire `src/modules/categories/` folder into your project.

```
src/modules/categories/
├── __tests__/
│   ├── categories.api.test.ts
│   └── categories.hooks.test.ts
├── categories.api.ts
├── categories.hooks.ts
├── categories.store.ts
├── categories.types.ts
├── index.ts
└── INTEGRATION.md
```

## Prerequisites

| Requirement | Notes |
|---|---|
| React 18+ / React 19 | Tested with React 19 |
| `@tanstack/react-query` v5+ | Needed for all hooks |
| `zustand` v4+ | Only needed if using `useCategoriesSelectionStore` |
| `QueryClientProvider` | Wrap your app root with it |
| Backend API | Public endpoints at `/api/categories`, admin at `/api/admin/categories` |

## Optional transport override

By default the module uses `globalRequest` from `@/app/helpers/globalRequest`. To use a different HTTP client:

```ts
import { setTransport } from "@/modules/categories";
import myAxiosInstance from "@/lib/axios";

setTransport({
  get: (endpoint) => myAxiosInstance.get(endpoint).then((r) => r.data),
  post: (endpoint, body) => myAxiosInstance.post(endpoint, body).then((r) => r.data),
  patch: (endpoint, body) => myAxiosInstance.patch(endpoint, body).then((r) => r.data),
  delete: (endpoint) => myAxiosInstance.delete(endpoint).then((r) => r.data),
});
```

Call `setTransport` once at app startup (e.g. in a root layout or provider) before any category hooks mount.

## Public routes (no auth required)

- `GET /api/categories` — list all published categories
- `GET /api/categories/:slug` — single category details with children

## Admin routes (auth required)

- `GET /api/admin/categories?page=&limit=&search=&sortBy=&sortOrder=` — paginated list
- `GET /api/admin/categories/:id` — single category detail
- `POST /api/admin/categories` — create a category
- `PATCH /api/admin/categories/:id` — update a category
- `DELETE /api/admin/categories/:id` — delete a category
- `POST /api/admin/categories/reorder` — reorder categories

Admin routes expect the transport to include an `Authorization` header with a valid token.

## Next.js App Router usage

### Server component prefetching

```tsx
import { QueryClient } from "@tanstack/react-query";
import { prefetchCategories } from "@/modules/categories";

export default async function CategoriesPage() {
  const queryClient = new QueryClient();
  await prefetchCategories(queryClient);
  // pass dehydrated state to client via HydrationBoundary
}
```

### Client component usage

```tsx
"use client";
import { useCategories } from "@/modules/categories";

export default function CategoryList() {
  const { data, isLoading } = useCategories();
  if (isLoading) return <p>Loading...</p>;
  return <ul>{data?.map((c) => <li key={c.id}>{c.name}</li>)}</ul>;
}
```

### Local selection state

```tsx
import { useCategoriesSelectionStore } from "@/modules/categories";

const selectedId = useCategoriesSelectionStore((s) => s.selectedCategoryId);
const setSelectedId = useCategoriesSelectionStore((s) => s.setSelectedCategoryId);
```

## Running tests

The module includes vitest tests for pure helpers and hooks.

```bash
# Install test dependencies (if not already present)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Run
npx vitest run src/modules/categories/
```

## What the module does NOT do

- ❌ Provide UI components or pages
- ❌ Install React Query or zustand in the host app
- ❌ Modify root layouts or providers
- ❌ Handle auth tokens or cookies directly
- ❌ Read environment variables
