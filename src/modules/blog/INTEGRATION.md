# Blog Module — Integration Checklist

> **Target app:** Any Next.js 16+ (App Router) project
> **Module path:** `src/modules/blog/`

## Copy the module

Copy the entire `src/modules/blog/` folder into your project.

```
src/modules/blog/
├── __tests__/
│   ├── blog.api.test.ts
│   └── blog.hooks.test.tsx
├── blog.api.ts
├── blog.config.ts
├── blog.hooks.ts
├── blog.store.ts
├── blog.types.ts
├── index.ts
└── INTEGRATION.md
```

## Prerequisites

| Requirement | Notes |
|---|---|
| Nextjs |
| `@tanstack/react-query` v5+ | Needed for all hooks |
| `zustand` v4+ | Only needed if using `useBlogUIStore` |
| `QueryClientProvider` | Wrap your app root with it |
| Backend API | Public endpoints at `/api/blog`, admin at `/api/admin/blog` |

## Optional transport override

By default the module uses `globalRequest` from `@/app/helpers/globalRequest`. To use a different HTTP client:

```ts
import { setTransport } from "@/modules/blog";
import myAxiosInstance from "@/lib/axios";

setTransport({
  get: (endpoint) => myAxiosInstance.get(endpoint).then((r) => r.data),
  post: (endpoint, body) => myAxiosInstance.post(endpoint, body).then((r) => r.data),
  patch: (endpoint, body) => myAxiosInstance.patch(endpoint, body).then((r) => r.data),
  delete: (endpoint) => myAxiosInstance.delete(endpoint).then((r) => r.data),
});
```

Call `setTransport` once at app startup (e.g. in a root layout or provider) before any blog hooks mount.

## Public routes (no auth required)

- `GET /api/blog` — paginated list of published blog posts
- `GET /api/blog/:slug` — single article detail by slug

## Admin routes (auth required)

- `GET /api/admin/blog?page=&limit=&search=&sortBy=&sortOrder=&category=&tag=&published=` — paginated list
- `GET /api/admin/blog/:id` — single article detail by ID
- `POST /api/admin/blog` — create a new article
- `PATCH /api/admin/blog/:id` — update an article
- `PATCH /api/admin/blog/:id/publish` — toggle publish/draft status
- `DELETE /api/admin/blog/:id` — delete an article

Admin routes expect the transport to include an `Authorization` header with a valid token.

## Module configuration

```ts
import { configureBlog } from "@/modules/blog";

configureBlog({
  baseURL: "https://your-api.com", // default: process.env.NEXT_PUBLIC_BACKEND_URL
  staleTime: 5 * 60 * 1000,       // public list cache (default: 5 min)
  adminStaleTime: 30 * 1000,       // admin list cache (default: 30 sec)
});
```

## Next.js App Router usage

### Server component prefetching

```tsx
import { QueryClient } from "@tanstack/react-query";
import { prefetchBlogPosts } from "@/modules/blog";

export default async function BlogPage() {
  const queryClient = new QueryClient();
  await prefetchBlogPosts(queryClient);
  // pass dehydrated state to client via HydrationBoundary
}
```

### Client component usage

```tsx
"use client";
import { useBlogPosts } from "@/modules/blog";

export default function ArticleList() {
  const { data, isLoading } = useBlogPosts({ page: 1, limit: 10 });
  if (isLoading) return <p>Loading...</p>;
  return (
    <ul>
      {data?.data.map((article) => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
```

### Single article page

```tsx
"use client";
import { useBlogPost } from "@/modules/blog";

export default function Article({ slug }: { slug: string }) {
  const { data, isLoading } = useBlogPost(slug);
  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Article not found</p>;
  return <article>{data.content}</article>;
}
```

### UI State management

```tsx
import { useBlogUIStore } from "@/modules/blog";

const selectedArticleId = useBlogUIStore((s) => s.selectedArticleId);
const setSelectedArticleId = useBlogUIStore((s) => s.setSelectedArticleId);
```

## Admin mutations

```tsx
"use client";
import { useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/modules/blog";

// Create
const createMutation = useCreateBlogPost();
createMutation.mutate({ title: "...", content: "...", categoryId: "cat-1" });

// Update
const updateMutation = useUpdateBlogPost();
updateMutation.mutate({ id: "art-1", input: { title: "Updated" } });

// Delete
const deleteMutation = useDeleteBlogPost();
deleteMutation.mutate("art-1");
```

## Type helpers

```ts
import {
  normalizeSlug,        // "Hello World" → "hello-world"
  estimateReadTime,     // word count → minutes
  generateExcerpt,      // HTML content → plain text excerpt
  parseArticleFilters,  // URL searchParams → ArticleFilters
  serializeArticleFilters, // ArticleFilters → Record<string, string>
  normalizeArticleFilters,  // fill defaults (page: 1, limit: 20, etc.)
} from "@/modules/blog";
```

## Running tests

```bash
pnpm vitest run src/modules/blog/
```

## What the module does NOT do

- ❌ Provide UI components or pages
- ❌ Install React Query or zustand in the host app
- ❌ Modify root layouts or providers
- ❌ Handle auth tokens or cookies directly
- ❌ Read environment variables (except through `configureBlog` or `configureProducts`)
