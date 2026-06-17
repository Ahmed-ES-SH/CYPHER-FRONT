# Cart Module Logic Analysis Report

> **Date:** 2025-06-17
> **Scope:** Frontend cart state management, UI behavior in `CartProducts.tsx`, `CartComponent.tsx`, and the `@src/modules/cart/` module
> **Focus:** State management, remove item behavior, quantity display, and data flow correctness

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [State Management Flow](#2-state-management-flow)
3. [Issue #1 — Remove Item in CartProducts.tsx Does Not Visually Work](#3-issue-1--remove-item-in-cartproducts-tsx-does-not-visually-work)
4. [Issue #2 — Cart Badge Shows Wrong Quantity Count](#4-issue-2--cart-badge-shows-wrong-quantity-count)
5. [Issue #3 — `isAuthenticated` in `useUnifiedCart` Is Not Reactive](#5-issue-3--isauthenticated-in-useunifiedcart-is-not-reactive)
6. [Issue #4 — Silent Failure on Authenticated Remove](#6-issue-4--silent-failure-on-authenticated-remove)
7. [Issue #5 — Inconsistent Item Count Between Navbar and Cart Page](#7-issue-5--inconsistent-item-count-between-navbar-and-cart-page)
8. [Issue #6 — Floating-Point Precision in Price Calculations](#8-issue-6--floating-point-precision-in-price-calculations)
9. [Issue #7 — No Loading/Feedback State on Remove](#9-issue-7--no-loadingfeedback-state-on-remove)
10. [Issue #8 — `onBeforeRedirect` Clears Cart Before Payment Confirmation](#10-issue-8--onbeforeredirect-clears-cart-before-payment-confirmation)
11. [Summary Table](#11-summary-table)
12. [Recommendations](#12-recommendations)

---

## 1. Architecture Overview

The cart module follows a **dual-source architecture**:

| Layer | Guest User | Authenticated User |
|---|---|---|
| **State** | Zustand store (`cart.store.ts`) persisted to `localStorage` | React Query (`cart.hooks.ts`) fetched from backend |
| **Hook** | `useGuestCart()` | `useCart()` + `useCartActions()` |
| **Unified** | `useUnifiedCart()` — transparently switches between guest/server based on `getActiveAuthAdapter().isAuthenticated` | Same |

### Key Files

| File | Role |
|---|---|
| `cart.store.ts` | Zustand store — guest items, persistence, cross-tab sync |
| `cart.hooks.ts` | React Query hooks — server cart CRUD, guest cart facade |
| `unified-cart.hooks.ts` | Unified hook — bridges guest/server into single `UnifiedCart` interface |
| `cart-selectors.ts` | Pure derived state — summaries, counts, warnings |
| `cart-utils.ts` | Money math, quantity validation, merge logic |
| `cart-mappers.ts` | DTO → domain object conversion |
| `cart.service.ts` | API functions, sync, checkout orchestration |
| `cart.transport.ts` | HTTP transport, adapters (auth, storage, redirect) |
| `CartProducts.tsx` | Navbar mini cart UI |
| `CartItems.tsx` | Full cart page item list |
| `CartComponent.tsx` | Full cart page with order summary |

---

## 2. State Management Flow

### Guest Cart Flow (Primary — Most Users)

```
ProductAction / Quantity&Actions / WishListProducts / SearchResultItem
  → useGuestCart().addItem(guestCartItem)
    → Zustand store: addGuestItem()
      → Merges quantity if duplicate, clamps to stock/min/max
      → Persists to localStorage via zustand/persist
      → Cross-tab sync via StorageEvent

CartProducts.tsx (Mini Cart)
  → useUnifiedCart().items  ← reads guestItems from store
  → useUnifiedCart().removeItem(productId)
    → guestCart.removeItem(productId)
      → Zustand store: removeGuestItem(productId)
        → Filters guestItems by productId
        → Triggers re-render via useShallow

CartItems.tsx (Full Cart Page)
  → useUnifiedCart().updateQuantity(productId, qty)
    → guestCart.updateQuantity(productId, qty)
      → Zustand store: updateGuestItemQuantity()
        → Clamps quantity, updates item
```

### Authenticated Cart Flow

```
useUnifiedCart().addItem(dto)
  → cartActions.addItem.mutate(dto)
    → addItemApi() → POST /api/cart/items
    → On success: invalidateCartDetail() → React Query refetches cart

useUnifiedCart().removeItem(productId)
  → productToCartItem.get(productId) → finds server CartItem
  → cartActions.removeItem.mutate(cartItem.id)
    → removeItemApi(itemId) → DELETE /api/cart/items/{itemId}
    → On success: invalidateCartDetail() → React Query refetches cart
```

---

## 3. Issue #1 — Remove Item in CartProducts.tsx Does Not Visually Work

**Severity:** HIGH
**Component:** `app/_components/_website/_navbar/CartProducts.tsx`
**Reported:** "remove item from CartProducts.tsx didn't work"

### Root Cause: Event Propagation Causes Mini Cart to Close on Remove

The mini cart container has an `onClick` handler that toggles visibility:

```tsx
// Line 59-64 — CartProducts.tsx
<div
  className="relative"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onClick={() => setShowMiniCart(!showMiniCart)}  // ← TOGGLES mini cart
>
```

Inside this container, the remove button also has an `onClick`:

```tsx
// Line 113-116 — CartProducts.tsx
<div
  onClick={() => {
    removeItem(item.productId);      // ← Step 1: Item removed from store
    toast.info("Removed from cart"); // ← Step 2: Toast shown
  }}
  className="group w-4 h-4 cursor-pointer absolute top-0 right-0 ..."
>
```

**What happens on click:**

1. `removeItem(item.productId)` fires → Zustand store updates → item removed
2. `toast.info("Removed from cart")` fires → toast appears
3. **Event bubbles up** to parent `<div>` → `setShowMiniCart(!showMiniCart)` fires
4. Since `showMiniCart` was `true`, it becomes `false` → **mini cart closes**

**User experience:** The user clicks remove, sees a toast, but the mini cart immediately closes. If they reopen it, the item is gone — but the immediate perception is "nothing happened" or "remove didn't work."

### The remove logic itself IS correct

The actual Zustand store operation works:
```tsx
// cart.store.ts — Line 80-85
removeGuestItem: (productId) =>
  set((state) => ({
    guestItems: state.guestItems.filter(
      (i) => i.productId !== productId,
    ),
  })),
```

The `UnifiedCartItem` mapping is correct:
```tsx
// unified-cart.hooks.ts — Line 42-55
function toUnifiedFromGuestItem(item: GuestCartItem): UnifiedCartItem {
  return {
    id: item.productId,       // id === productId for guest items
    productId: item.productId, // ✅ Correctly preserved
    // ...
  };
}
```

The `removeItem` callback correctly routes to the store:
```tsx
// unified-cart.hooks.ts — Line 132-144
const removeItem = useCallback(
  (productId: string) => {
    if (isAuthenticated) {
      const cartItem = productToCartItem.get(productId);
      if (cartItem) {
        cartActions.removeItem.mutate(cartItem.id);
      }
    } else {
      guestCart.removeItem(productId); // ✅ Correct path for guest
    }
  },
  // ...
);
```

### Fix Required

Add `e.stopPropagation()` to the remove button's click handler:

```tsx
// CartProducts.tsx — Line 113-116
<div
  onClick={(e) => {
    e.stopPropagation();           // ← ADD THIS
    removeItem(item.productId);
    toast.info("Removed from cart");
  }}
  className="..."
>
```

---

## 4. Issue #2 — Cart Badge Shows Wrong Quantity Count

**Severity:** MEDIUM
**Component:** `app/_components/_website/_navbar/CartProducts.tsx`
**Reported:** "the numbers look wrong"

### Root Cause: Badge Uses `items.length` Instead of Total Quantity

```tsx
// CartProducts.tsx — Line 69-73
{items.length > 0 && (
  <div className="w-4 h-4 absolute -top-1 -right-2 bg-primary animate-bounce text-white flex items-center justify-center text-[10px] font-bold rounded-full">
    {items.length}  {/* ← BUG: Shows number of UNIQUE items, not total quantity */}
  </div>
)}
```

**Example of the bug:**
- User adds Product A (qty: 3) and Product B (qty: 2)
- `items.length` = 2 (two unique products)
- Badge shows "2" instead of "5" (total items)

### Compare with CartComponent.tsx (correct)

```tsx
// CartComponent.tsx — Line 28
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
// ✅ Correctly sums all quantities
```

### Compare with selectGuestCartSummary (correct)

```tsx
// cart-selectors.ts — Line 35
const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
// ✅ Correctly sums all quantities
```

### Compare with useUnifiedCart.itemCount (correct)

```tsx
// unified-cart.hooks.ts — Line 109-114
const itemCount = useMemo((): number => {
  if (isAuthenticated && serverCart) {
    return serverCart.itemCount;
  }
  return guestCart.itemCount; // ← This IS the sum of quantities
}, [isAuthenticated, serverCart, guestCart.itemCount]);
```

### Fix Required

Use `itemCount` from `useUnifiedCart()` instead of `items.length`:

```tsx
// CartProducts.tsx
const { items, removeItem, clearItems, itemCount } = useUnifiedCart();

// Then in JSX:
{itemCount > 0 && (
  <div className="...">
    {itemCount}  {/* ← FIX: Shows total quantity */}
  </div>
)}
```

---

## 5. Issue #3 — `isAuthenticated` in `useUnifiedCart` Is Not Reactive

**Severity:** MEDIUM
**Component:** `src/modules/cart/unified-cart.hooks.ts`

### Root Cause: Module-Level Variable Used Instead of Reactive State

```tsx
// unified-cart.hooks.ts — Line 76-77
export function useUnifiedCart(): UnifiedCart {
  const { isAuthenticated } = getActiveAuthAdapter();  // ← NOT reactive
```

`getActiveAuthAdapter()` reads from a module-level variable:

```tsx
// cart.transport.ts — Line 29-37
let activeAuthAdapter: AuthAdapter = defaultAuthAdapter;

export function getActiveAuthAdapter(): AuthAdapter {
  return activeAuthAdapter;  // ← Just reads a module variable
}
```

**The `setAuthAdapter` is called in `ClientLayout.tsx`:**
```tsx
// ClientLayout.tsx — Line 23-29
useEffect(() => {
  if (isReady) {
    setAuthAdapter({
      userId: user?.id ?? null,
      isAuthenticated,
    });
  }
}, [user, isAuthenticated, isReady]);
```

**Impact:**
- When a user logs in, `setAuthAdapter` updates the module variable
- But `useUnifiedCart()` doesn't re-render because it doesn't subscribe to auth changes
- The `removeItem` callback might take the wrong branch (guest vs authenticated)
- The `items` array might show guest items when it should show server items (or vice versa)

### What should happen

`useUnifiedCart` should react to auth state changes and switch between guest/server data accordingly.

---

## 6. Issue #4 — Silent Failure on Authenticated Remove

**Severity:** LOW
**Component:** `src/modules/cart/unified-cart.hooks.ts`

### Root Cause: No Error Handling When `productToCartItem` Lookup Fails

```tsx
// unified-cart.hooks.ts — Line 132-144
const removeItem = useCallback(
  (productId: string) => {
    if (isAuthenticated) {
      const cartItem = productToCartItem.get(productId);
      if (cartItem) {
        cartActions.removeItem.mutate(cartItem.id);
      }
      // ← No else branch — silent failure if cartItem not found
    } else {
      guestCart.removeItem(productId);
    }
  },
  [isAuthenticated, productToCartItem, cartActions.removeItem, guestCart.removeItem],
);
```

If `productToCartItem.get(productId)` returns `undefined` (e.g., stale React Query cache, race condition), the remove silently does nothing. No toast, no error log.

### Fix Required

Add error handling:
```tsx
if (isAuthenticated) {
  const cartItem = productToCartItem.get(productId);
  if (cartItem) {
    cartActions.removeItem.mutate(cartItem.id);
  } else {
    console.error(`[cart] Item not found for productId: ${productId}`);
    toast.error("Failed to remove item. Please try again.");
  }
}
```

---

## 7. Issue #5 — Inconsistent Item Count Between Navbar and Cart Page

**Severity:** LOW
**Components:** `CartProducts.tsx` vs `CartComponent.tsx`

### The Inconsistency

| Location | Calculation | Shows |
|---|---|---|
| `CartProducts.tsx` badge (line 71) | `items.length` | Number of unique products |
| `CartProducts.tsx` total price (line 54-56) | `reduce(sum + unitPrice * qty)` | Correct total |
| `CartComponent.tsx` subtotal label (line 28) | `reduce(sum + item.quantity)` | Total quantity |
| `selectGuestCartSummary` (line 35) | `reduce(sum + item.quantity)` | Total quantity |
| `useUnifiedCart().itemCount` (line 109-114) | `guestCart.itemCount` | Total quantity |

The badge is the only place that uses `items.length`. All other calculations correctly sum quantities.

---

## 8. Issue #6 — Floating-Point Precision in Price Calculations

**Severity:** LOW
**Components:** `CartProducts.tsx`, `CartComponent.tsx`, `CartItems.tsx`

### Root Cause: Dollar Conversion Done in UI Layer Instead of Store/Selectors

```tsx
// CartProducts.tsx — Line 54-56
const totalPrice = items.reduce((acc, item) => {
  return acc + (item.unitPrice.amount / 100) * item.quantity;
}, 0);
```

```tsx
// CartComponent.tsx — Line 22-25
const subtotal = items.reduce(
  (sum, item) => sum + (item.unitPrice.amount / 100) * item.quantity,
  0,
);
```

```tsx
// CartItems.tsx — Line 115
const itemSubtotal = (item.unitPrice.amount / 100) * item.quantity;
```

**Problem:** Each UI component independently converts cents to dollars and computes totals. This:
1. Duplicates business logic across 3 components
2. Uses floating-point arithmetic (`/ 100`), which can cause precision issues (e.g., `19.99 * 3 = 59.970000000000006`)
3. The `selectGuestCartSummary` selector already computes the correct total in **minor units** (cents), but the UI ignores it and recalculates in dollars

### The selector already provides correct values

```tsx
// cart-selectors.ts — Line 18-46
export function selectGuestCartSummary(items: GuestCartItem[]): CartSummary {
  // ...
  const subtotalAmount = items
    .filter((i) => i.unitPrice.currency === currency)
    .reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  // Returns Money in cents — no floating-point issues
}
```

### `useUnifiedCart` already exposes `summary`

```tsx
// unified-cart.hooks.ts — Line 100-106
const summary = useMemo((): CartSummary => {
  if (isAuthenticated && serverCart) {
    return selectCartSummary(serverCart);
  }
  return guestCart.summary;
}, [isAuthenticated, serverCart, guestCart.summary]);
```

### Fix Required

Use `summary.total.amount` (in cents) and divide by 100 once for display:

```tsx
const { items, summary } = useUnifiedCart();
const totalPrice = summary.total.amount / 100; // Single conversion point
```

---

## 9. Issue #7 — No Loading/Feedback State on Remove

**Severity:** LOW
**Components:** `CartProducts.tsx`, `CartItems.tsx`

### Current Behavior

When the user clicks remove:
1. `removeItem(productId)` fires
2. `toast.info("Removed from cart")` fires immediately
3. For guest: Zustand store updates synchronously → UI updates
4. For authenticated: React Query mutation fires → API call → cache invalidation → refetch

**For authenticated users**, there's no loading indicator during the API call. The toast fires optimistically before the server confirms. If the API fails, the item reappears on the next refetch but the user already saw "Removed from cart."

### `useUnifiedCart` exposes `isPending`

```tsx
// unified-cart.hooks.ts — Line 183-188
isPending:
  cartActions.addItem.isLoading ||
  cartActions.removeItem.isLoading ||
  cartActions.updateItem.isLoading ||
  cartActions.clearCart.isLoading,
```

But `CartProducts.tsx` doesn't use `isPending`.

---

## 10. Issue #8 — `onBeforeRedirect` Clears Cart Before Payment Confirmation

**Severity:** MEDIUM
**Components:** `useCheckout.ts`, `CartComponent.tsx`, `CartProducts.tsx`

### Root Cause: Cart Cleared on Client Before Stripe Redirect

```tsx
// useCheckout.ts — Line 85-86
// Call before redirect hook (e.g., clear cart)
onBeforeRedirect?.();
```

```tsx
// CartComponent.tsx — Line 15-20
const { isCheckingOut, checkout } = useCheckout({
  items,
  shippingMethod,
  currency: "usd",
  onBeforeRedirect: () => clearItems(),  // ← Clears cart BEFORE redirect
});
```

```tsx
// CartProducts.tsx — Line 21-26
const { isCheckingOut, checkout } = useCheckout({
  items,
  shippingMethod: "free_shipping",
  currency: "usd",
  onBeforeRedirect: () => clearItems(),  // ← Same pattern
});
```

**The problem:** The cart is cleared client-side before the Stripe redirect. If:
- The user's browser crashes during redirect
- The network drops
- The user navigates away
- Stripe checkout fails

...the cart is already gone. The user loses their items with no way to recover.

**Best practice:** Clear the cart AFTER the webhook confirms payment success, not before redirect.

---

## 11. Summary Table

| # | Issue | Severity | Component | Type |
|---|---|---|---|---|
| 1 | Remove button click bubbles up and closes mini cart | HIGH | `CartProducts.tsx` | UX Bug |
| 2 | Cart badge shows `items.length` instead of total quantity | MEDIUM | `CartProducts.tsx` | Logic Bug |
| 3 | `isAuthenticated` in `useUnifiedCart` is not reactive | MEDIUM | `unified-cart.hooks.ts` | Architecture |
| 4 | Silent failure on authenticated remove when item not found | LOW | `unified-cart.hooks.ts` | Error Handling |
| 5 | Inconsistent item count between navbar and cart page | LOW | `CartProducts.tsx` | Inconsistency |
| 6 | Floating-point precision from repeated cents→dollars conversion | LOW | Multiple UI files | Code Quality |
| 7 | No loading state during authenticated remove | LOW | `CartProducts.tsx` | UX Gap |
| 8 | Cart cleared before Stripe payment confirmation | MEDIUM | `useCheckout.ts` | Reliability |

---

## 12. Recommendations

### Immediate Fixes (High Priority)

1. **`CartProducts.tsx` — Add `e.stopPropagation()` to remove button** (Issue #1)
2. **`CartProducts.tsx` — Replace `items.length` with `itemCount` in badge** (Issue #2)

### Short-Term Improvements (Medium Priority)

3. **`unified-cart.hooks.ts` — Make `isAuthenticated` reactive** (Issue #3)
   - Option A: Accept `isAuthenticated` as a parameter from the consuming component
   - Option B: Use a Zustand auth store subscription instead of module-level variable
   - Option C: Wrap `useUnifiedCart` in a context that provides auth state

4. **`useCheckout.ts` — Move `clearItems()` to post-webhook** (Issue #8)
   - Clear cart only after `payment_intent.succeeded` webhook is received
   - Or at minimum, only after Stripe redirect to success page confirms payment

5. **`unified-cart.hooks.ts` — Add error handling for failed lookups** (Issue #4)

### Long-Term Improvements (Low Priority)

6. **Centralize price display** — Create a `useCartTotals()` hook that returns formatted dollar amounts from the `summary` in cents (Issue #6)
7. **Add optimistic UI with rollback** for authenticated remove mutations (Issue #7)
8. **Standardize item count** — All badge/label counts should use the same `itemCount` source (Issue #5)
