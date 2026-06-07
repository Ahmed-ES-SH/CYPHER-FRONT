# Cart Module — Issue Analysis & Fix Plan

> **Module path:** `src/modules/cart/`
> **Analysis date:** 2026-05-29
> **Scope:** Performance · Logic · Architecture · Security · Testing · DX

---

## Table of Contents

1. [Summary](#1-summary)
2. [Issue Index](#2-issue-index)
3. [Performance Issues](#3-performance-issues)
4. [Logic Issues](#4-logic-issues)
5. [Architecture & Design Issues](#5-architecture--design-issues)
6. [Security Issues](#6-security-issues)
7. [Testing Gaps](#7-testing-gaps)
8. [Developer Experience (DX) Issues](#8-developer-experience-dx-issues)
9. [Proposed Fixes — Code Examples](#9-proposed-fixes--code-examples)

---

## 1. Summary

The `src/modules/cart` module is well-structured overall — it uses a clear separation of concerns across transport, service, store, hooks, selectors, mappers, and utilities. However, after a thorough audit, **16 distinct issues** were identified spanning performance, logic correctness, architecture design, security, and test coverage. Each issue is paired with a concrete resolution.

| Category | Count |
|---|---|
| Performance | 4 |
| Logic / Correctness | 5 |
| Architecture / Design | 3 |
| Security | 2 |
| Testing Gaps | 2 |
| Developer Experience | 2 |
| **Total** | **18** |

---

## 2. Issue Index

| # | Severity | Category | Title | File |
|---|---|---|---|---|
| P-1 | 🔴 High | Performance | `useCartActions` creates 5 mutations on every render | `cart.hooks.ts` |
| P-2 | 🟠 Medium | Performance | `useGuestCart` calls 5 separate `useCartStore` subscriptions | `cart.hooks.ts` |
| P-3 | 🟠 Medium | Performance | `selectGuestCartSummary` recomputes on every render — no memoization | `cart-selectors.ts` / `cart.hooks.ts` |
| P-4 | 🟡 Low | Performance | `invalidateCart` invalidates the entire `["cart"]` key tree unnecessarily | `cart-invalidation.ts` / `cart.hooks.ts` |
| L-1 | 🔴 High | Logic | `validateQuantity` silently accepts `stock = 0`, returns `0` — clashes with `MIN_QUANTITY = 1` | `cart-utils.ts` |
| L-2 | 🔴 High | Logic | `syncGuestCart` maps all errors to a single message, losing per-item error details | `cart.service.ts` |
| L-3 | 🟠 Medium | Logic | `selectGuestCartSummary` assumes all items share the same currency via `items[0]` — multicurrency cart silently wrong | `cart-selectors.ts` |
| L-4 | 🟠 Medium | Logic | `useCartSummary` shows guest summary during `isLoading` even when user is authenticated | `cart.hooks.ts` |
| L-5 | 🟡 Low | Logic | `mergeGuestItemsWithCart` uses guest `stock` to clamp, ignoring server-side stock from `cartItems` | `cart-utils.ts` |
| A-1 | 🟠 Medium | Architecture | Module-level `window.addEventListener` in `cart.store.ts` runs at import time — breaks SSR/test isolation | `cart.store.ts` |
| A-2 | 🟠 Medium | Architecture | `transportRequest` helper supports `PUT` in its signature but the `Transport` interface has no `put` method — dead code | `cart.transport.ts` |
| A-3 | 🟡 Low | Architecture | `cart.api.ts` re-export layer is redundant — creates two import paths for the same symbols | `cart.api.ts` |
| S-1 | 🔴 High | Security | `defaultRedirectAdapter.to()` uses `window.location.href` directly — open redirect if `url` is ever user-controlled | `cart.transport.ts` |
| S-2 | 🟠 Medium | Security | `localStorage` data from cross-tab sync is parsed without schema validation | `cart.store.ts` |
| T-1 | 🟠 Medium | Testing | Zero coverage for `cart.service.ts` network paths (`syncGuestCart`, `prepareAndCheckout`, checkout validation) | `__tests__/` |
| T-2 | 🟡 Low | Testing | `cart.store.ts` cross-tab sync listener is never tested | `__tests__/` |
| D-1 | 🟡 Low | DX | `toGuestCartItem` uses positional arguments (8 params) — highly error-prone to call | `cart-mappers.ts` |
| D-2 | 🟡 Low | DX | `CART_RULES.MAX_QUANTITY = 99` is hardcoded in `productTypeAdapter` as well — duplication | `adapters/product-type.adapter.ts` |

---

## 3. Performance Issues

---

### P-1 🔴 — `useCartActions` recreates 5 mutations on every render

**File:** [`cart.hooks.ts`](../src/modules/cart/cart.hooks.ts) · Lines 69–159

**Problem:**
`useCartActions` calls `useMutation` five times at the top level of the hook. Because `useCartStore()` (line 71) subscribes to the entire store object, any store state change (e.g., a guest item being added) causes the entire hook component to re-render, which rebuilds all mutation objects — even though mutations are idempotent.

```ts
// Every store change re-runs this entire block
export function useCartActions() {
  const queryClient = useQueryClient();
  const store = useCartStore(); // ← subscribes to full store — any change triggers re-render

  const addMutation = useMutation({ ... });
  const updateMutation = useMutation({ ... });
  const removeMutation = useMutation({ ... });
  const clearMutation = useMutation({ ... });
  const checkoutMutation = useMutation({ ... });
  ...
}
```

**Impact:** Every guest item add/remove/update fires 5 unnecessary mutation recreations in any component using `useCartActions`.

**Fix:**
Scope `useCartStore` subscription to only the methods that are actually needed, and use granular selectors:

```ts
export function useCartActions() {
  const queryClient = useQueryClient();
  // Only subscribe to the exact action needed — not the whole store
  const clearGuestItems = useCartStore((s) => s.clearGuestItems);
  ...
}
```

---

### P-2 🟠 — `useGuestCart` makes 5 separate store subscriptions

**File:** [`cart.hooks.ts`](../src/modules/cart/cart.hooks.ts) · Lines 190–208

**Problem:**
`useGuestCart` calls `useCartStore` five times with five separate selectors:

```ts
const guestItems           = useCartStore((s) => s.guestItems);
const isHydrated           = useCartStore((s) => s.isHydrated);
const addGuestItem         = useCartStore((s) => s.addGuestItem);
const removeGuestItem      = useCartStore((s) => s.removeGuestItem);
const updateGuestItemQty   = useCartStore((s) => s.updateGuestItemQuantity);
const clearGuestItems      = useCartStore((s) => s.clearGuestItems);
```

Each subscription creates a separate store listener. Zustand's `useStore` with individual selectors is fine, but 5 separate calls for pure actions (which never change reference) is wasteful.

**Fix:**
Actions (functions) never change reference in Zustand. Extract state-only slices separately, and use a single call with `useShallow` for the action bundle:

```ts
import { useShallow } from 'zustand/react/shallow';

export function useGuestCart() {
  const { guestItems, isHydrated } = useCartStore(
    useShallow((s) => ({ guestItems: s.guestItems, isHydrated: s.isHydrated }))
  );
  // Actions are stable references — only need to read them once
  const actions = useCartStore.getState();
  ...
}
```

---

### P-3 🟠 — `selectGuestCartSummary` recomputes on every render

**File:** [`cart-selectors.ts`](../src/modules/cart/cart-selectors.ts) · Lines 18–31 & [`cart.hooks.ts`](../src/modules/cart/cart.hooks.ts) · Line 205

**Problem:**
`selectGuestCartSummary(guestItems)` is called directly inside `useGuestCart` and `useCartSummary` on every render:

```ts
// In useGuestCart — recomputes on every render regardless of whether guestItems changed
summary: selectGuestCartSummary(guestItems),
```

The function performs `reduce` over all items — an O(n) operation — that could be memoized.

**Fix:**
Memoize the result using `useMemo` inside the hooks:

```ts
import { useMemo } from 'react';

export function useGuestCart() {
  const guestItems = useCartStore((s) => s.guestItems);
  const summary = useMemo(() => selectGuestCartSummary(guestItems), [guestItems]);
  ...
  return { ..., summary };
}
```

---

### P-4 🟡 — `invalidateCart` nukes the entire query tree

**File:** [`cart-invalidation.ts`](../src/modules/cart/cart-invalidation.ts) · Line 5 & [`cart.hooks.ts`](../src/modules/cart/cart.hooks.ts) · Lines 76, 87, 93

**Problem:**
`invalidateCart` invalidates all keys under `["cart"]`, which includes `["cart", "count"]`, `["cart", "checkout"]`, and `["cart", "mutations"]` — even when the mutation only affects the cart detail:

```ts
export function invalidateCart(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.all }); // invalidates ["cart"] + ALL children
}
```

This means after a simple `addItem`, the checkout query and count query are also invalidated, causing unnecessary refetches.

**Fix:**
Prefer targeted invalidation in mutation `onSuccess` handlers. Use `invalidateCartDetail` for mutations that only change cart contents, and reserve `invalidateCart` (broad) for destructive operations like `clearCart`:

```ts
// In addMutation, updateMutation, removeMutation:
onSuccess: () => {
  invalidateCartDetail(queryClient); // only refetch the detail
},

// In clearMutation:
onSuccess: () => {
  store.clearGuestItems();
  invalidateCart(queryClient); // clear all — this is justified
},
```

---

## 4. Logic Issues

---

### L-1 🔴 — `validateQuantity` with `stock = 0` returns `0`, bypassing `MIN_QUANTITY`

**File:** [`cart-utils.ts`](../src/modules/cart/cart-utils.ts) · Lines 33–68

**Problem:**
When `stock = 0`, the function clamps the quantity to `0`, even though `MIN_QUANTITY = 1`. This means a caller can receive `{ valid: false, clamped: 0 }` — a zero quantity — which is then silently stored in the guest cart:

```ts
// stock = 0, minimum = 1, quantity = 1
// Step 1: clamped = 1 (passes minimum check)
// Step 2: clamped > stock (1 > 0) → clamped = 0  ← RETURNS 0!
if (clamped > stock) {
  clamped = stock; // stock = 0 → clamped = 0
}
```

The `addGuestItem` action in the store calls `clampGuestQuantity`, which calls `validateQuantity`. If a product has 0 stock, a quantity of 0 can end up stored.

**Fix:**
After clamping to stock, ensure clamped never goes below `minimum`, and return an explicit out-of-stock reason:

```ts
if (clamped > stock) {
  clamped = stock;
}

// NEW: prevent zero or below-minimum result
if (stock === 0) {
  return {
    valid: false,
    clamped: 0,
    reason: 'Item is out of stock',
  };
}

if (clamped < minimum) {
  clamped = minimum;
}
```

Also update `addGuestItem` in the store to guard against adding items with 0 stock:

```ts
addGuestItem: (item) =>
  set((state) => {
    if (item.stock === 0) return state; // NEW: guard
    ...
  }),
```

---

### L-2 🔴 — `syncGuestCart` error handling loses per-item context

**File:** [`cart.service.ts`](../src/modules/cart/cart.service.ts) · Lines 113–122

**Problem:**
When `syncGuestCartApi` throws, the catch block maps **all** guest items to the same generic error message, losing any item-specific context from the server:

```ts
} catch (error) {
  const parsed = parseCartApiError(error);
  return {
    success: false,
    errors: guestItems.map((item) => ({
      productId: item.productId,
      reason: parsed.message, // ← same reason for every item, regardless of which failed
    })),
  };
}
```

The server may have returned a specific validation error (e.g., "Product X is out of stock" or "Product Y no longer exists") which is thrown away.

**Fix:**
Preserve the full parsed error object and its field-level errors map. If the server returns per-item errors (as `errors` field), map them correctly:

```ts
} catch (error) {
  const parsed = parseCartApiError(error);
  const fieldErrors = parsed.errors ?? {};

  return {
    success: false,
    errors: guestItems.map((item) => ({
      productId: item.productId,
      reason: fieldErrors[item.productId]?.[0] ?? parsed.message,
    })),
  };
}
```

---

### L-3 🟠 — `selectGuestCartSummary` breaks silently with mixed currencies

**File:** [`cart-selectors.ts`](../src/modules/cart/cart-selectors.ts) · Lines 18–31

**Problem:**
The guest cart summary assumes all items share the same currency by reading only `items[0]`:

```ts
const currency = items[0]?.unitPrice.currency ?? CART_RULES.DEFAULT_CURRENCY;
const subtotalAmount = items.reduce(
  (sum, item) => sum + item.unitPrice.amount * item.quantity,
  0,
);
```

If a user somehow has items in different currencies (e.g., EUR and USD), the amounts are summed together as if they were the same currency, producing a completely wrong total.

**Fix:**
Validate currency consistency and throw (or warn) on mismatch, or group by currency:

```ts
export function selectGuestCartSummary(items: GuestCartItem[]): CartSummary {
  if (items.length === 0) {
    return { itemCount: 0, subtotal: createMoney(0), total: createMoney(0), currency: CART_RULES.DEFAULT_CURRENCY };
  }

  const currency = items[0].unitPrice.currency;

  // Guard: detect mixed currencies
  const hasMixedCurrencies = items.some((i) => i.unitPrice.currency !== currency);
  if (hasMixedCurrencies) {
    console.warn('[cart] Mixed currencies in guest cart — totals will be inaccurate');
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAmount = items
    .filter((i) => i.unitPrice.currency === currency) // only sum matching currency
    .reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);

  return {
    itemCount,
    subtotal: createMoney(subtotalAmount, currency),
    total: createMoney(subtotalAmount, currency),
    currency,
  };
}
```

---

### L-4 🟠 — `useCartSummary` shows stale guest summary during loading for authenticated users

**File:** [`cart.hooks.ts`](../src/modules/cart/cart.hooks.ts) · Lines 31–48

**Problem:**
When a logged-in user loads the page, `useCart` fires a network request (`isLoading = true`). During this window, `useCartSummary` falls back to the guest summary:

```ts
if (isLoading || error || !serverCart) {
  return {
    summary: selectGuestCartSummary(guestItems), // guest summary shown while server data loads
    ...
  };
}
```

This causes a visible flash: the UI may briefly show `0 items` (empty guest cart) then jump to the correct server-side count after load. If the guest cart was not cleared properly after a previous login, it may show outdated items.

**Fix:**
Distinguish between "authenticated but loading" and "not authenticated / using guest":

```ts
export function useCartSummary(enabled = true) {
  const guestItems = useCartStore((s) => s.guestItems);
  const { data: serverCart, isLoading, error } = useCart(enabled);

  // If server cart loaded successfully, always use it
  if (serverCart) {
    return { summary: selectCartSummary(serverCart), isLoading: false, error: null };
  }

  // Return loading state without showing potentially stale guest data
  if (isLoading) {
    return { summary: selectGuestCartSummary(guestItems), isLoading: true, error: null };
  }

  // Error state or cart not enabled — fallback to guest
  return {
    summary: selectGuestCartSummary(guestItems),
    isLoading: false,
    error: error ?? null,
  };
}
```

---

### L-5 🟡 — `mergeGuestItemsWithCart` clamps using guest stock, not server stock

**File:** [`cart-utils.ts`](../src/modules/cart/cart-utils.ts) · Lines 90–114

**Problem:**
When merging guest items into an authenticated cart, the function uses `guest.stock` for validation. But the guest item's stock was captured at the time the product was added to the local guest cart — potentially hours or days ago. The server cart's items (`cartItems`) may have more accurate (newer) stock values that are ignored:

```ts
const { clamped } = validateQuantity(
  currentQty + guest.quantity,
  guest.stock, // ← stale local stock, not server-verified
  guest.minimumQuantity,
  guest.maximumQuantity,
);
```

**Fix:**
Prefer the server cart's stock when the product exists on the server:

```ts
for (const guest of guestItems) {
  const existing = cartMap.get(guest.productId);
  const currentQty = existing?.quantity ?? 0;
  // Use server stock if available (more up-to-date), fall back to guest stock
  const authorativeStock = existing?.stock ?? guest.stock;
  const { clamped } = validateQuantity(
    currentQty + guest.quantity,
    authorativeStock,
    guest.minimumQuantity,
    guest.maximumQuantity,
  );
  addItems.push({ productId: guest.productId, quantity: clamped });
}
```

---

## 5. Architecture & Design Issues

---

### A-1 🟠 — Module-level `window.addEventListener` runs at import time

**File:** [`cart.store.ts`](../src/modules/cart/cart.store.ts) · Lines 130–146

**Problem:**
The cross-tab sync listener is registered at module evaluation time (top-level `if (typeof window !== "undefined")`). This causes two problems:

1. **SSR leak risk:** Although guarded by `typeof window`, the module must still be carefully handled in SSR environments. Some bundler/tree-shaker configurations may not tree-shake the `window` block correctly.
2. **Test isolation broken:** In unit tests, `window.addEventListener` is polluted globally by the module import. Tests can inadvertently trigger storage events from previous test runs, causing unexpected state changes. There is no cleanup/removal mechanism.

```ts
// This runs at module evaluation time — cannot be unregistered
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => { ... });
}
```

**Fix:**
Expose an initialization function that also returns a cleanup function. Call it from the app shell, not at module scope:

```ts
// cart.store.ts — export a setup/teardown pair
export function initCartCrossTabSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as { state?: { guestItems?: GuestCartItem[] } };
        const guestItems = parsed?.state?.guestItems;
        if (Array.isArray(guestItems)) {
          useCartStore.setState({ guestItems });
        }
      } catch { /* ignore */ }
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
```

Usage in app shell:

```tsx
// app/layout.tsx or a CartProvider component
useEffect(() => {
  const cleanup = initCartCrossTabSync();
  return cleanup;
}, []);
```

---

### A-2 🟠 — `transportRequest` supports `PUT` but `Transport` interface has no `put` method

**File:** [`cart.transport.ts`](../src/modules/cart/cart.transport.ts) · Lines 233–252

**Problem:**
`transportRequest` accepts `"PUT"` as a valid method in its type signature, but the `Transport` interface does not include a `put` method. The `switch` default falls back to `t.get()` for any unrecognized method — meaning a `PUT` request silently becomes a `GET`:

```ts
export async function transportRequest<TResult = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET", // PUT listed here
  ...
): Promise<TResult> {
  switch (method) {
    case "GET":   return t.get<TResult>(endpoint);
    case "POST":  return t.post<TResult>(endpoint, body);
    case "PATCH": return t.patch<TResult>(endpoint, body);
    case "DELETE": return t.delete<TResult>(endpoint);
    default: return t.get<TResult>(endpoint); // ← PUT silently becomes GET
  }
}
```

**Fix Option A — Remove `PUT` from the type signature (recommended):**

```ts
export async function transportRequest<TResult = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", // remove PUT
  ...
```

**Fix Option B — Add `put` to the Transport interface and implement it:**

```ts
export interface Transport {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body?: unknown): Promise<T>;
  patch<T>(endpoint: string, body?: unknown): Promise<T>;
  put<T>(endpoint: string, body?: unknown): Promise<T>; // add
  delete<T>(endpoint: string): Promise<T>;
}
```

---

### A-3 🟡 — Dual import paths via `cart.api.ts` re-export layer

**File:** [`cart.api.ts`](../src/modules/cart/cart.api.ts)

**Problem:**
`cart.api.ts` re-exports everything from the specific files, creating two valid import paths for every symbol:

```ts
// Path A (via index.ts)
import { addItemApi } from '@/src/modules/cart';

// Path B (via cart.api.ts re-export layer)
import { addItemApi } from '@/src/modules/cart/cart.api';

// Path C (direct — what cart.api.ts itself recommends)
import { addItemApi } from '@/src/modules/cart/cart.service';
```

The file's own comment says "New code should import from the specific files directly" — making the file self-contradictory. This causes confusion and increases bundle analysis difficulty.

**Fix:**
Delete `cart.api.ts` entirely. The `index.ts` barrel already covers backward compatibility. Update `index.ts` with a comment noting it is the canonical re-export layer. Any external import using `cart.api` should be migrated to `index.ts` imports.

---

## 6. Security Issues

---

### S-1 🔴 — Open redirect vulnerability in `defaultRedirectAdapter`

**File:** [`cart.transport.ts`](../src/modules/cart/cart.transport.ts) · Lines 102–109

**Problem:**
The default redirect adapter uses `window.location.href` directly with the `url` returned from the backend:

```ts
const defaultRedirectAdapter: RedirectAdapter = {
  to: (url) => {
    window.location.href = url; // ← redirects to any URL, including external domains
  },
  replace: (url) => {
    window.location.replace(url);
  },
};
```

If the backend is ever compromised or returns a manipulated URL (e.g., `javascript:alert(1)` or `https://malicious.site`), the browser will follow it without any validation. For a Stripe checkout flow, the URL will typically be a `https://checkout.stripe.com/...` URL, but there is no enforcement.

**Fix:**
Validate the URL before redirecting — only allow HTTPS and optionally allowlist trusted domains:

```ts
const ALLOWED_REDIRECT_ORIGINS = [
  'https://checkout.stripe.com',
  // Add your own app origin:
  typeof window !== 'undefined' ? window.location.origin : '',
].filter(Boolean);

function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_REDIRECT_ORIGINS.some((origin) => url.startsWith(origin));
  } catch {
    return false;
  }
}

const defaultRedirectAdapter: RedirectAdapter = {
  to: (url) => {
    if (!isSafeRedirectUrl(url)) {
      console.error(`[cart] Blocked unsafe redirect to: ${url}`);
      return;
    }
    window.location.href = url;
  },
  replace: (url) => {
    if (!isSafeRedirectUrl(url)) {
      console.error(`[cart] Blocked unsafe redirect to: ${url}`);
      return;
    }
    window.location.replace(url);
  },
};
```

---

### S-2 🟠 — Cross-tab `localStorage` data parsed without schema validation

**File:** [`cart.store.ts`](../src/modules/cart/cart.store.ts) · Lines 131–145

**Problem:**
The `storage` event listener parses incoming data from `localStorage` and directly calls `useCartStore.setState` with it:

```ts
const parsed = JSON.parse(event.newValue) as {
  state?: { guestItems?: GuestCartItem[] };
};
const guestItems = parsed?.state?.guestItems;
if (Array.isArray(guestItems)) {
  useCartStore.setState({ guestItems }); // ← no field validation of array contents
}
```

An attacker who can write to `localStorage` (via XSS in another tab) could inject arbitrary `GuestCartItem` objects with crafted `productId`, `productImage` (for XSS), or negative prices. Since this data later flows into UI rendering components, it is a vector for stored XSS via `localStorage`.

**Fix:**
Validate each item's shape before accepting it. Use a lightweight runtime type guard:

```ts
function isValidGuestCartItem(item: unknown): item is GuestCartItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.productId === 'string' && i.productId.length > 0 &&
    typeof i.productName === 'string' &&
    typeof i.productSlug === 'string' &&
    typeof i.productImage === 'string' &&
    typeof i.quantity === 'number' && i.quantity >= 0 &&
    typeof i.stock === 'number' &&
    typeof i.minimumQuantity === 'number' &&
    typeof i.maximumQuantity === 'number' &&
    typeof i.unitPrice === 'object' && i.unitPrice !== null &&
    typeof (i.unitPrice as Record<string, unknown>).amount === 'number' &&
    typeof (i.unitPrice as Record<string, unknown>).currency === 'string'
  );
}

// In storage event handler:
if (Array.isArray(guestItems) && guestItems.every(isValidGuestCartItem)) {
  useCartStore.setState({ guestItems });
}
```

---

## 7. Testing Gaps

---

### T-1 🟠 — No tests for `cart.service.ts` business logic paths

**File:** [`__tests__/cart.api.test.ts`](../src/modules/cart/__tests__/cart.api.test.ts)

**Problem:**
The existing test file covers utilities, mappers, selectors, and error normalization well. However, `cart.service.ts` contains critical business logic with **zero direct test coverage**:

- `syncGuestCart()` — the guest cart → server sync flow
- `prepareAndCheckout()` — the checkout validation + API call flow
- `validateCheckoutPrerequisites()` — checkout guard logic
- All error paths in `syncGuestCart`

**Fix — Tests to add:**

```ts
describe('validateCheckoutPrerequisites', () => {
  it('returns invalid when both cart and guestItems are empty', () => {
    const result = validateCheckoutPrerequisites(undefined, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Cart is empty');
  });

  it('returns invalid when cart has out-of-stock items', () => {
    const cart = { items: [{ quantity: 5, stock: 2 }] } as Cart;
    const result = validateCheckoutPrerequisites(cart, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Some items are out of stock');
  });

  it('returns valid when cart has in-stock items', () => {
    const cart = { items: [{ quantity: 2, stock: 10 }] } as Cart;
    const result = validateCheckoutPrerequisites(cart, []);
    expect(result.valid).toBe(true);
  });
});

describe('prepareAndCheckout', () => {
  it('returns validation errors without calling checkoutApi when cart is empty', async () => {
    const result = await prepareAndCheckout({}, { cart: undefined, guestItems: [] });
    expect(result.validation?.valid).toBe(false);
    expect(result.result).toBeUndefined();
  });

  it('calls checkoutApi and returns result when validation passes', async () => {
    vi.spyOn(service, 'checkoutApi').mockResolvedValue({ sessionId: 's1', url: 'https://checkout.stripe.com/...' });
    const cart = { items: [{ quantity: 1, stock: 10 }] } as Cart;
    const result = await prepareAndCheckout({}, { cart });
    expect(result.result?.sessionId).toBe('s1');
  });
});

describe('syncGuestCart', () => {
  it('fetches cart when guestItems is empty', async () => { ... });
  it('calls syncGuestCartApi with merged items', async () => { ... });
  it('returns error result when API throws', async () => { ... });
});
```

---

### T-2 🟡 — Cross-tab sync listener is untested

**File:** [`cart.store.ts`](../src/modules/cart/cart.store.ts) · Lines 130–146

**Problem:**
The `storage` event listener that syncs guest cart across tabs has **no tests at all**. This is high-risk code that mutates global store state based on external input.

**Fix — Tests to add:**

```ts
describe('cart.store cross-tab sync', () => {
  it('updates guestItems when storage event fires with valid data', () => {
    const newItems: GuestCartItem[] = [/* ... */];
    const storageValue = JSON.stringify({ state: { guestItems: newItems } });

    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_STORAGE_KEY,
      newValue: storageValue,
    }));

    expect(useCartStore.getState().guestItems).toEqual(newItems);
  });

  it('ignores storage events with wrong key', () => {
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'some-other-key',
      newValue: JSON.stringify({ state: { guestItems: [{}] } }),
    }));
    expect(useCartStore.getState().guestItems).toEqual([]);
  });

  it('ignores malformed JSON in storage event', () => {
    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_STORAGE_KEY,
      newValue: 'NOT JSON',
    }));
    expect(useCartStore.getState().guestItems).toEqual([]);
  });
});
```

---

## 8. Developer Experience (DX) Issues

---

### D-1 🟡 — `toGuestCartItem` has 8 positional parameters

**File:** [`cart-mappers.ts`](../src/modules/cart/cart-mappers.ts) · Lines 49–71

**Problem:**
`toGuestCartItem` accepts 8 positional arguments:

```ts
export function toGuestCartItem(
  productId: string,
  productName: string,
  productSlug: string,
  productImage: string,
  unitPrice: Money,
  quantity: number,
  stock: number,
  minimumQuantity = CART_RULES.MIN_QUANTITY,
  maximumQuantity = CART_RULES.MAX_QUANTITY,
): GuestCartItem {
```

This is extremely error-prone. Callers must get the argument order exactly right — and TypeScript won't help if two `string` args are swapped (e.g., `productSlug` and `productImage`).

**Fix:**
Convert to a single options object:

```ts
export interface ToGuestCartItemOptions {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: Money;
  quantity: number;
  stock: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
}

export function toGuestCartItem(options: ToGuestCartItemOptions): GuestCartItem {
  return {
    productId: options.productId,
    productName: options.productName,
    productSlug: options.productSlug,
    productImage: options.productImage,
    unitPrice: options.unitPrice,
    quantity: options.quantity,
    stock: options.stock,
    minimumQuantity: options.minimumQuantity ?? CART_RULES.MIN_QUANTITY,
    maximumQuantity: options.maximumQuantity ?? CART_RULES.MAX_QUANTITY,
  };
}
```

---

### D-2 🟡 — `CART_RULES.MAX_QUANTITY` duplicated in `productTypeAdapter`

**File:** [`adapters/product-type.adapter.ts`](../src/modules/cart/adapters/product-type.adapter.ts) · Line 23

**Problem:**
The product adapter hardcodes `99` as the max quantity instead of referencing `CART_RULES.MAX_QUANTITY`:

```ts
getMaxQuantity: () => 99, // should be CART_RULES.MAX_QUANTITY
```

If `CART_RULES.MAX_QUANTITY` is ever changed, this will silently diverge.

**Fix:**

```ts
import { CART_RULES } from '../cart.types';

export const productTypeAdapter: ProductAdapter<ProductType> = {
  ...
  getMaxQuantity: () => CART_RULES.MAX_QUANTITY, // reference the constant
};
```

---

## 9. Proposed Fixes — Code Examples

Quick reference table of all fixes:

| # | File | Change Type | Effort |
|---|---|---|---|
| P-1 | `cart.hooks.ts` | Replace `useCartStore()` with scoped selector | Small |
| P-2 | `cart.hooks.ts` | Use `useShallow` for action bundle | Small |
| P-3 | `cart.hooks.ts` | Wrap `selectGuestCartSummary` in `useMemo` | Trivial |
| P-4 | `cart.hooks.ts` + `cart-invalidation.ts` | Use `invalidateCartDetail` in non-destructive mutations | Small |
| L-1 | `cart-utils.ts` + `cart.store.ts` | Add stock=0 guard in `validateQuantity` and `addGuestItem` | Small |
| L-2 | `cart.service.ts` | Map field-level server errors to per-item reasons | Small |
| L-3 | `cart-selectors.ts` | Validate currency consistency, filter by currency | Medium |
| L-4 | `cart.hooks.ts` | Separate `isLoading` from error fallback in `useCartSummary` | Small |
| L-5 | `cart-utils.ts` | Prefer server stock over guest stock in `mergeGuestItemsWithCart` | Small |
| A-1 | `cart.store.ts` | Extract listener into `initCartCrossTabSync()` + cleanup | Medium |
| A-2 | `cart.transport.ts` | Remove `PUT` from `transportRequest` type or add `put` to `Transport` | Trivial |
| A-3 | `cart.api.ts` | Delete file; consolidate to `index.ts` | Trivial |
| S-1 | `cart.transport.ts` | Add URL validation in `defaultRedirectAdapter` | Small |
| S-2 | `cart.store.ts` | Add runtime type guard before `setState` in storage listener | Small |
| T-1 | `__tests__/` | Add tests for `cart.service.ts` service functions | Medium |
| T-2 | `__tests__/` | Add tests for cross-tab sync listener | Small |
| D-1 | `cart-mappers.ts` | Convert `toGuestCartItem` to options object | Medium |
| D-2 | `adapters/product-type.adapter.ts` | Reference `CART_RULES.MAX_QUANTITY` instead of `99` | Trivial |

---

*Report generated by Antigravity — Cart Module Audit, 2026-05-29*
