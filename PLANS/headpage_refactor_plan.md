# HeadPage & Shop Layout Refactor Plan

## Context

The `shop/layout.tsx` wraps all `/(pathes)/shop/*` pages. Currently each page component (ShopProducts, PhonesShop, LaptopsShop) fetches its own data independently. The `HeadPage.tsx` controls sorting/showing but uses global context (`VariablesContext`) and doesn't wire to real API params. The goal is to make the layout the single controller for filtering, sorting, pagination, and grid view, with all child components receiving data rather than fetching it themselves.

---

## Architecture Decision

**Next.js App Router layouts cannot pass props to `{children}` (page components).**

The user wants "all control in layout, pass as props". Since that's not technically possible in App Router, the solution is:

> **Layout wraps children in a `ShopProvider` context that owns all state and data fetching.**

This achieves the same separation: the layout file becomes the orchestrator, and child page components consume from the provider. The provider lives in a new file imported by the layout.

---

## Phase 1 — Create `ShopProvider` (the controller)

**New file:** `app/(pathes)/shop/ShopProvider.tsx`

Responsibilities:
- Read URL search params as the single source of truth for `sortBy`, `sortOrder`, `limit`, `page`, `gridView`
- Provide functions to update these params (via `router.replace` with new search params)
- Fetch products using `useProducts()` from `src/modules/products` with the current params
- Expose: products, pagination metadata (`total`, `page`, `limit`, `totalPages`), sorting/showing state, grid view mode
- Use `productToLegacy` adapter to convert to `ProductType[]` for backward compat with existing `ProductCard`

**Files to create:**
- `app/(pathes)/shop/ShopProvider.tsx`

### `ProductQuery` type update

The existing `ProductQuery.sortBy` doesn't include `"updatedAt"` matching the backend plan. Update if needed:

```typescript
// src/modules/products/types/product-dto.types.ts
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "title" | "rating" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
}
```

This already matches what we need. No changes required.

---

## Phase 2 — Refactor `HeadPage.tsx`

**File:** `app/_components/_website/_shop/HeadPage.tsx`

### 2.1 — Remove global VariablesContext dependency
- Accept props (or use ShopContext) instead of `useVariables()` for `openDropdown`/`setOpenDropdown`
- Manage dropdown state locally with `useState` + `useRef` on container

### 2.2 — Fix dropdown toggle behavior
**Current bug:** Clicking the trigger while dropdown is open → dropddown's `mousedown` outside handler fires → calls `onClose()` → trigger's `onClick` fires → reopens it. Result: dropdown never closes on second click.

**Fix:** Use a local `isSortOpen` / `isShowOpen` state per dropdown. Use `useRef` on the container `div` (wrapping both trigger and dropdown). Attach `mousedown` handler on `useEffect` to close only when click is outside the container ref.

### 2.3 — Wire sort options to API params

| Display text | sortBy | sortOrder |
|---|---|---|
| "Sort by latest" | `createdAt` | `desc` |
| "Sort by popularity" | `rating` | `desc` |
| "Sort by average rating" | `rating` | `desc` |
| "Sort by price : low to high" | `price` | `asc` |
| "Sort by price : hight to low" | `price` | `desc` |

**Note:** "Popularity" and "Average rating" both map to `rating` sort. This is existing behavior; flag as potentially redundant but keep as-is.

When user selects a sort option, call provider's `onSortChange(sortBy, sortOrder)`.

### 2.4 — Wire showing options to limit param

| Display text | limit |
|---|---|
| "16 items" | `16` |
| "32 items" | `32` |
| "48 items" | `48` |
| "64 items" | `64` |

When user selects a page size, call provider's `onLimitChange(limit)` and reset page to 1.

### 2.5 — Dynamic "showing X–Y of Z results"

Replace hardcoded string with computed values from provider:

```
showing {start}–{end} of {total} results
```

Where:
- `start = (page - 1) * limit + 1`
- `end = min(page * limit, total)`
- `total` = total from API response

Hide if `total === 0`.

### 2.6 — Grid view toggle

- `LuLayoutDashboard` and `LiaStackExchange` become clickable buttons
- Active state highlighted (e.g., `text-primary-blue`, others `text-gray-300`)
- Clicking calls provider's `onGridViewChange('grid' | 'list')`

---

## Phase 3 — Update `shop/layout.tsx`

**File:** `app/(pathes)/shop/layout.tsx`

- Import and wrap children with `ShopProvider`
- Keep existing components (`FirstShopSection`, `Breadcrumb`, `ProductsFilter`, `SliderOfRecommendedProducts`) — these are not affected by the change
- Remove direct data fetching (categories fetch is fine)
- `HeadPage` will consume from `ShopProvider` instead of global `VariablesContext`

---

## Phase 4 — Update page components to consume from ShopProvider

### 4.1 — `ShopProducts.tsx` (main shop page)
- Remove `useProducts` call and `useData` dependency
- Consume products from `ShopContext`
- Remove client-side pagination → use `page` and `totalPages` from provider
- Keep `SelectedCategories` display
- Pass gridView to `ProductCard` (list vs grid layout)

### 4.2 — `PhonesShop.tsx` (cellphones page)
- Remove `useData` dependency and legacy data fetching
- Consume from `ShopContext` (provider will detect route `/shop/cellphones` and set `categorySlug: "smartphones"`)
- Remove client-side pagination → use provider's values

### 4.3 — `LaptopsShop.tsx` (laptops page)
- Remove `useProducts` call
- Consume from `ShopContext` (provider will detect route `/shop/Laptops` and set `categorySlug: "laptops"`)
- Remove client-side pagination → use provider's values

### Route → Category detection in ShopProvider:
```typescript
const pathname = usePathname();
const categorySlug = useMemo(() => {
  if (pathname.includes('/shop/cellphones')) return 'smartphones';
  if (pathname.includes('/shop/Laptops')) return 'laptops';
  return undefined; // main shop page — no category filter
}, [pathname]);
```

---

## Phase 5 — Grid/List view support in ProductCard

**File:** `app/_components/_website/_products/ProductCard.tsx`

- Accept optional `viewMode?: 'grid' | 'list'` prop
- In `'list'` mode:
  - Layout changes to horizontal (image left, details right)
  - Full width, single column
  - More text visible (no line-clamp)
- In `'grid'` mode: current behavior

**Alternative:** Create a separate `ProductListCard` component if the styling differs too much from `ProductCard`.

---

## Phase 6 — Cleanup

### 6.1 — Dropdown component
- No changes needed — already has click-outside-to-close behavior via `useRef` + `mousedown` listener
- Current file is fine

### 6.2 — ProductsFilter (sidebar)
- Currently uses `VariablesContext.categories` for selection state
- Keep as-is for now — it's a separate concern from HeadPage controls

### 6.3 — SelectedCategories
- Currently uses `VariablesContext`
- Keep as-is for now

---

## Edge Cases & Considerations

1. **Layout can't pass props to pages** — ShopProvider pattern solves this
2. **Empty results** — Show "No products match your filters" when `data.length === 0`
3. **Loading state** — Show spinner while API is fetching
4. **Page reset on filter change** — When sort or limit changes, reset page to 1 (handled by URL param updates)
5. **Default limit** — `limit=16` matches current behavior, but `ProductQuery` default is 10. ShopProvider should explicitly default to 16
6. **Legacy type compatibility** — All components use `ProductType`. `productToLegacy` adapter is already in place

---

## File Change Summary

| File | Action |
|---|---|
| `app/(pathes)/shop/ShopProvider.tsx` | **CREATE** — shop context/state controller |
| `app/(pathes)/shop/layout.tsx` | **EDIT** — wrap with ShopProvider |
| `app/_components/_website/_shop/HeadPage.tsx` | **EDIT** — local dropdown state, wire to API params, dynamic results count, grid toggle |
| `app/_components/_website/_shop/ShopProducts.tsx` | **EDIT** — consume from ShopContext |
| `app/_components/_website/_shop/PhonesShop.tsx` | **EDIT** — consume from ShopContext |
| `app/_components/_website/_shop/LaptopsShop.tsx` | **EDIT** — consume from ShopContext |
| `app/_components/_website/_products/ProductCard.tsx` | **EDIT** — support list view mode |
| `app/(pathes)/shop/page.tsx` | **EDIT** — may need to become client component or split |

**No changes to:** `src/modules/products/*` (types/API/hooks/services), `Dropdown.tsx`, `ProductsFilter.tsx`, `SelectedCategories.tsx`, `VariablesContext.tsx`, `DataContext.tsx`.

---

## Feedback & Concerns Addressed

### 1. VariablesContext vs ShopProvider synchronization risk

**Concern:** Category selection state lives in `VariablesContext` while sorting/pagination lives in `ShopProvider` — could they desync?

**Assessment:** Not a real issue for this refactor. `VariablesContext.categories` controls which **category filter chips** appear (the SelectedCategories bar) and what `categoryData` is fetched in `DataContext`. It does **not** control the URL-based product query. The ShopProvider fetches products via `useProducts()` with its own `sortBy`/`sortOrder`/`limit`/`page` params. These are independent concerns: category chips are UI-only decoration, while the actual data fetching is driven by URL params. They coexist without conflict.

**Impact:** None. No changes needed.

### 2. Category filters + URL search params

**Concern:** Should categories eventually sync to URL params for consistency with "URL as source of truth"?

**Assessment:** This is a **future concern**, not a blocker. Currently the category filter sidebar (ProductsFilter) writes to `VariablesContext.categories`, and `DataContext` fetches matching products into `categoryData`. The page components optionally show `categoryData` OR the main product list. This is a dual-data-source pattern that predates this refactor.

**Impact:** If/when the sidebar is migrated to use URL params, the ShopProvider would gain `categorySlug`/`categoryIds` from the URL. For now, this refactor leaves the sidebar untouched.

**Recommendation:** Add a note that category filters are out of scope for this refactor but should eventually be URL-driven. No code change.

### 3. Pathname-to-category mapping maintainability

**Concern:** The `if/else` chain for `/shop/cellphones → smartphones`, `/shop/Laptops → laptops` is fragile.

**Assessment:** It's 2 routes. Adding a third would be another `else if`. This is fine for the current app scope.

**Recommendation:** Minor improvement — use a lookup object instead of if-chain:

```typescript
const ROUTE_CATEGORY_MAP: Record<string, string | undefined> = {
  '/cellphones': 'smartphones',
  '/Laptops': 'laptops',
};
const categorySlug = ROUTE_CATEGORY_MAP[pathname.split('/shop')[1]];
```

This is a **preference, not a requirement**. Current plan already works.

### 4. Where should productToLegacy live?

**Concern:** Transform logic inside ShopProvider vs. extracted.

**Assessment:** `productToLegacy` is a thin adapter (1:1 field mapping). Putting it inside ShopProvider is fine — it's not shared business logic. The existing pattern in `DataContext.tsx` and `ShopProducts.tsx` already does the same inline mapping with `useMemo`.

**Recommendation:** Keep `productToLegacy` inside ShopProvider as a `useMemo`. If/when more transformations appear, extract to a dedicated transform layer.

### 5. Hidden edge cases

| Edge case | Risk | Mitigation |
|---|---|---|
| Route change while filters are active | User navigates shop→cellphones→shop. URL params persist, could cause stale category. | ShopProvider recomputes `categorySlug` on pathname change via `useMemo`, and React Query refetches automatically. |
| Sort param `rating` maps from 2 labels | "Popularity" and "Average rating" both send `sortBy=rating&sortOrder=desc`. | Functional but redundant. User won't notice — same result. Flag for future cleanup. |
| Limit value resets to 10 on first fetch | `ProductQuery` default is 10, but HeadPage shows "16 items". | ShopProvider explicitly sets `limit: 16` from URL param or default override. |
| DummyPagination receives `totalPages` from ShopProvider instead of computing locally | DummyPagination uses `setPage` but ShopProvider uses URL-based page updates. | DummyPagination's `setPage` must call `onPageChange(n)` URL update instead of local `useState`. Same interface, different implementation. |
| Products page (`shop/page.tsx`) is a Server Component | Can't use hooks/context. | Make it a thin wrapper that delegates to a client component (or convert to `"use client"`). |

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

Each phase can be tested independently. Phase 1 (ShopProvider) is the foundation — nothing works without it.
