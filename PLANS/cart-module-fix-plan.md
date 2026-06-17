# Cart Module Fix Plan

> **Date:** 2025-06-17
> **Source:** `reports/cart-logic-analysis.md`
> **Status:** PHASE 1 & 2 COMPLETE — Phase 3 In Progress
> **Estimated Effort:** 2-3 sprints (phased approach)
> **Last Updated:** 2026-06-17

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issue Registry](#2-issue-registry)
3. [Phase 1 — Critical UX Fixes (Sprint 1)](#3-phase-1--critical-ux-fixes-sprint-1)
4. [Phase 2 — Architecture & Reliability (Sprint 2)](#4-phase-2--architecture--reliability-sprint-2)
5. [Phase 3 — Code Quality & Polish (Sprint 3)](#5-phase-3--code-quality--polish-sprint-3)
6. [Testing Strategy](#6-testing-strategy)
7. [Risk Assessment](#7-risk-assessment)
8. [Dependencies & Blocked Items](#8-dependencies--blocked-items)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Appendix — File Change Matrix](#10-appendix--file-change-matrix)

---

## 1. Executive Summary

The cart module analysis identified **8 issues** across UX, logic, architecture, error handling, and reliability. This plan organizes them into **3 execution phases** ordered by severity, dependency, and implementation risk.

| Phase | Focus | Issues | Sprint | Status |
|---|---|---|---|---|
| **Phase 1** | Critical UX Fixes | #1, #2 | Sprint 1 | ✅ COMPLETE |
| **Phase 2** | Architecture & Reliability | #3, #4, #8 | Sprint 2 | ✅ COMPLETE |
| **Phase 3** | Code Quality & Polish | #5, #6, #7 | Sprint 3 | 🔄 IN PROGRESS |

**Key principles for this plan:**
- Each phase is independently deployable — no cross-phase blockers
- Phase 1 delivers immediate user-visible improvement
- Phase 2 fixes foundational architecture issues that affect long-term stability
- Phase 3 improves code quality and developer experience

---

## 2. Issue Registry

| ID | Issue | Severity | Phase | Effort | Files Affected | Status |
|---|---|---|---|---|---|---|
| #1 | Remove button click bubbles up and closes mini cart | HIGH | 1 | XS | `CartProducts.tsx` | ✅ Done |
| #2 | Cart badge shows `items.length` instead of total quantity | MEDIUM | 1 | XS | `CartProducts.tsx` | ✅ Done |
| #3 | `isAuthenticated` in `useUnifiedCart` is not reactive | MEDIUM | 2 | M | `unified-cart.hooks.ts`, `cart.transport.ts`, `cart-auth.store.ts` | ✅ Done |
| #4 | Silent failure on authenticated remove when item not found | LOW | 2 | XS | `unified-cart.hooks.ts` | ✅ Done |
| #5 | Inconsistent item count between navbar and cart page | LOW | 3 | XS | `CartProducts.tsx`, `CartComponent.tsx` | 🔄 Pending |
| #6 | Floating-point precision from repeated cents→dollars conversion | LOW | 3 | S | `CartProducts.tsx`, `CartComponent.tsx`, `CartItems.tsx`, `cart-utils.ts` | 🔄 Pending |
| #7 | No loading state during authenticated remove | LOW | 3 | S | `CartProducts.tsx`, `CartItems.tsx` | 🔄 Pending |
| #8 | Cart cleared before Stripe payment confirmation | MEDIUM | 2 | M | `useCheckout.ts`, `PaymentSuccess.tsx` | ✅ Done |

**Effort scale:** XS (< 1h) | S (1-3h) | M (3-8h) | L (1-2d)

---

## 3. Phase 1 — Critical UX Fixes (Sprint 1) ✅ COMPLETE

### Goal

Fix the two highest-impact user-facing bugs that affect every mini cart interaction.

**Estimated effort:** ~2 hours total
**Risk:** Very low — isolated UI changes with no architecture impact
**Status:** ✅ Completed

---

### Task 1.1 — Fix Mini Cart Close-on-Remove (Issue #1)

**Priority:** P0 — HIGH
**Effort:** XS (~30 min)
**Files to modify:** `app/_components/_website/_navbar/CartProducts.tsx`

#### Description

The remove button's click event bubbles up to the mini cart container's `onClick` handler, which toggles `showMiniCart` to `false`. This causes the mini cart to close immediately after removing an item, making it appear as though the remove action failed.

#### Implementation Steps

1. **Read** `CartProducts.tsx` to locate the remove button click handler (around line 113-116)
2. **Add** `e.stopPropagation()` as the first line in the remove button's `onClick` handler
3. **Verify** the handler signature accepts the event parameter: `(e: React.MouseEvent)`

#### Expected Code Change

```tsx
// BEFORE (line ~113-116)
<div
  onClick={() => {
    removeItem(item.productId);
    toast.info("Removed from cart");
  }}
  className="..."
>

// AFTER
<div
  onClick={(e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(item.productId);
    toast.info("Removed from cart");
  }}
  className="..."
>
```

#### Verification

- [x] Open mini cart with 2+ items
- [x] Click remove on one item — mini cart should remain open
- [x] Verify the removed item disappears from the list
- [x] Verify toast notification still appears
- [x] Test on mobile (touch events should also work)

---

### Task 1.2 — Fix Cart Badge Quantity Display (Issue #2) ✅ DONE

**Priority:** P1 — MEDIUM
**Effort:** XS (~30 min)
**Files to modify:** `app/_components/_website/_navbar/CartProducts.tsx`

#### Description

The cart badge in the navbar shows `items.length` (number of unique products) instead of the total quantity across all items. For example, if a user has Product A (qty: 3) and Product B (qty: 2), the badge shows "2" instead of "5".

#### Implementation Steps

1. **Read** `CartProducts.tsx` to locate the badge display (around line 69-73)
2. **Extract** `itemCount` from the `useUnifiedCart()` destructuring
3. **Replace** `items.length` with `itemCount` in both the condition and the display

#### Verification

- [x] Add Product A (qty: 3) and Product B (qty: 2)
- [x] Badge should show "5", not "2"
- [x] Remove one item — badge updates correctly
- [x] Clear cart — badge disappears
- [x] Test with single item (qty: 1) — badge shows "1"

---

### Phase 1 Deliverables Checklist ✅ COMPLETE

- [x] `CartProducts.tsx` — `e.stopPropagation()` added to remove button (line 113)
- [x] `CartProducts.tsx` — badge uses `itemCount` instead of `items.length` (lines 68-71)
- [x] Manual QA: mini cart remove flow works correctly
- [x] Manual QA: badge shows correct total quantity
- [x] No TypeScript errors after changes
- [x] No new console warnings

---

## 4. Phase 2 — Architecture & Reliability (Sprint 2) ✅ COMPLETE

### Goal

Fix the reactive auth state issue, add error handling for silent failures, and make the checkout flow more resilient by not clearing the cart prematurely.

**Estimated effort:** ~10-16 hours total
**Risk:** Medium — touches core state management and checkout flow
**Status:** ✅ Completed

---

### Task 2.1 — Make `isAuthenticated` Reactive in `useUnifiedCart` (Issue #3) ✅ DONE

**Priority:** P1 — MEDIUM
**Effort:** M (~4-6h)
**Files modified:** `src/modules/cart/unified-cart.hooks.ts`, `src/modules/cart/cart.transport.ts`, `src/modules/cart/cart-auth.store.ts`

#### Description

`useUnifiedCart()` calls `getActiveAuthAdapter()` which reads from a module-level variable. This is not reactive — when a user logs in/out, `useUnifiedCart` doesn't re-render, causing it to show stale data (guest items when it should show server items, or vice versa).

#### Recommended Approach: Option B — Zustand Auth Store Subscription

**Rationale:** The project already uses Zustand for state management. Adding a small auth-aware Zustand store is the least invasive approach and keeps the cart module self-contained.

#### Implementation Steps

1. **Create** a minimal auth state store or extend an existing one:
   - If `src/modules/auth/store/` exists, use it
   - Otherwise, create `src/modules/cart/cart-auth.store.ts` with:
     ```ts
     interface CartAuthState {
       isAuthenticated: boolean;
       userId: string | null;
       setAuth: (isAuthenticated: boolean, userId: string | null) => void;
     }
     ```

2. **Update** `cart.transport.ts` to expose a reactive subscription:
   - Add a `subscribeToAuth` function that uses the auth store
   - Or change `getActiveAuthAdapter` to read from the Zustand store

3. **Update** `unified-cart.hooks.ts`:
   - Subscribe to the auth store using `useStore` or `useStoreWithEqualityFn`
   - Use the reactive `isAuthenticated` value instead of calling `getActiveAuthAdapter()`
   - Ensure `items` and `itemCount` recalculate when auth state changes

4. **Update** the auth adapter setter (`ClientLayout.tsx` or wherever `setAuthAdapter` is called):
   - Also dispatch to the Zustand auth store when auth state changes

5. **Add guest-to-server cart migration logic**:
   - When user logs in, merge localStorage guest cart with server cart
   - When user logs out, the server cart is no longer relevant — use local state

#### Verification

- [x] Login as new user → cart shows empty server cart
- [x] Login as user with existing cart items → items appear
- [x] Add item as guest → login → item migrates to server cart
- [x] Logout → cart switches back to local guest cart
- [x] Verify no stale items from wrong source after auth transitions

---

### Task 2.2 — Add Error Handling for Authenticated Remove (Issue #4) ✅ DONE

**Priority:** P2 — LOW
**Effort:** XS (~30 min)
**Files modified:** `src/modules/cart/unified-cart.hooks.ts`

#### Description

When `productToCartItem.get(productId)` returns `undefined` during an authenticated remove, the operation silently fails with no user feedback or logging.

#### Implementation Steps

1. **Read** `unified-cart.hooks.ts` to locate the `removeItem` callback (around line 132-144)
2. **Add** an `else` branch after the `cartItem` check
3. **Log** the error and show a toast to the user

#### Applied Code Change

```tsx
// CURRENT (lines 133-148)
const removeItem = useCallback(
  (productId: string) => {
    if (isAuthenticated) {
      const cartItem = productToCartItem.get(productId);
      if (cartItem) {
        cartActions.removeItem.mutate(cartItem.id);
      } else {
        console.error(`[cart] Item not found for productId: ${productId}`);
        toast.error("Failed to remove item. Please try again.");
      }
    } else {
      guestCart.removeItem(productId);
    }
  },
  [isAuthenticated, productToCartItem, cartActions.removeItem, guestCart.removeItem],
);
```

#### Verification

- [x] Authenticated user with items in cart → remove works normally
- [x] If cart state is stale (simulated via cache manipulation) → user sees error toast
- [x] Console shows error log with productId for debugging

---

### Task 2.3 — Move Cart Clearing to Post-Webhook (Issue #8) ✅ DONE

**Priority:** P1 — MEDIUM
**Effort:** M (~4-6h)
**Files modified:** `useCheckout.ts`, `PaymentSuccess.tsx`

#### Description

The cart was previously cleared client-side **before** the Stripe redirect (`onBeforeRedirect` callback). If the redirect fails, the user loses their cart items with no way to recover. Fixed by removing the pre-redirect clear and instead clearing on the success page as a fallback.

#### What Was Done

1. **`useCheckout.ts`** — Removed all `onBeforeRedirect` / `clearItems` calls. The checkout hook now only handles Stripe session creation and redirect — no cart mutation.

2. **`PaymentSuccess.tsx`** (lines 70-78) — Added client-side cart clearing as a fallback after payment success:
   ```tsx
   // Clear cart after successful payment (fallback for when webhook hasn't fired yet)
   useEffect(() => {
     if (paymentStatus === "success") {
       useCartStore.getState().clearGuestItems();
       queryClient.invalidateQueries({ queryKey: cartKeys.all });
     }
   }, [paymentStatus, queryClient]);
   ```

3. **`CartComponent.tsx`** — No `clearItems` in checkout flow (clean).

4. **Webhook** — The backend webhook handler is responsible for clearing the server-side cart after `payment_intent.succeeded`. The frontend success page acts as a fallback.

#### Current Flow

```
User clicks "Pay"
  → checkout() creates Stripe session via /api/checkout
  → User redirected to Stripe
  → Stripe processes payment
  → Webhook fires: payment_intent.succeeded (backend clears server cart)
  → User redirected to /paymentsuccess?payment_status=success
  → PaymentSuccess useEffect clears guest cart + invalidates queries (fallback)
```

#### Verification

- [x] Start checkout → close browser tab before Stripe redirect → cart items preserved
- [x] Complete checkout → cart cleared on success page
- [x] Cart NOT cleared before Stripe redirect
- [x] Success page clears guest cart and invalidates server cart queries

---

### Phase 2 Deliverables Checklist ✅ COMPLETE

- [x] `cart-auth.store.ts` — Created Zustand auth store with `isAuthenticated` + `userId`
- [x] `cart.transport.ts` — `setAuthAdapter()` syncs to Zustand store (line 35)
- [x] `unified-cart.hooks.ts` — subscribes to `useCartAuthStore((s) => s.isAuthenticated)` (line 78)
- [x] `unified-cart.hooks.ts` — error handling added for failed lookups (lines 140-141)
- [x] `useCheckout.ts` — no `onBeforeRedirect` / `clearItems` calls
- [x] `PaymentSuccess.tsx` — clears guest cart + invalidates queries on success (lines 70-78)
- [x] Auth state transitions work correctly (login/logout)
- [x] No TypeScript errors after changes

---

## 5. Phase 3 — Code Quality & Polish (Sprint 3) 🔄 IN PROGRESS

### Goal

Centralize price calculations, add loading states, and standardize item count usage across all cart UI.

**Estimated effort:** ~6-8 hours total
**Risk:** Low — isolated UI improvements

---

### Task 3.1 — Standardize Item Count Across All Components (Issue #5) 🔄 PENDING

**Priority:** P2 — LOW
**Effort:** XS (~30 min)
**Files to modify:** `CartComponent.tsx` (minor), possibly `CartItems.tsx`

#### Current State Analysis

| Component | How item count is computed | Uses `itemCount`? |
|---|---|---|
| `CartProducts.tsx` | `useUnifiedCart().itemCount` | ✅ Yes (line 15, 68-70) |
| `CartComponent.tsx` | `items.reduce((sum, item) => sum + item.quantity, 0)` (line 27) | ❌ No — manual reduction |
| `CartItems.tsx` | No explicit item count display | N/A |

#### Description

`CartComponent.tsx` manually computes `totalItems` via `items.reduce()` instead of using the already-available `itemCount` from `useUnifiedCart()`. While the logic is equivalent, it duplicates the calculation and could drift if the summary logic changes.

#### Implementation Steps

1. **Read** `CartComponent.tsx` to locate the `totalItems` calculation (line 27)
2. **Extract** `itemCount` from `useUnifiedCart()` destructuring (line 12)
3. **Replace** `totalItems` with `itemCount`

#### Expected Code Change

```tsx
// CURRENT (line 12)
const { items } = useUnifiedCart();

// AFTER
const { items, itemCount } = useUnifiedCart();

// CURRENT (line 27)
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

// DELETE this line entirely — use `itemCount` directly

// CURRENT (line 50)
{subtotal} ({totalItems} {totalItems === 1 ? "item" : "items"})

// AFTER
{subtotal} ({itemCount} {itemCount === 1 ? "item" : "items"})
```

#### Verification

- [ ] All cart components show the same item count
- [ ] Cart page subtotal line shows correct count (e.g., "Subtotal (5 items)")
- [ ] Mini cart badge shows same count as cart page
- [ ] No component uses `items.reduce()` for counting when `itemCount` is available

---

### Task 3.2 — Centralize Price Calculations (Issue #6) 🔄 PENDING

**Priority:** P2 — LOW
**Effort:** S (~2-3h)
**Files to modify:** `cart-utils.ts`, `CartProducts.tsx`, `CartComponent.tsx`, `CartItems.tsx`

#### Current State Analysis

| Component | Price Calculation | Line(s) | Uses `summary`? |
|---|---|---|---|
| `CartProducts.tsx` | `items.reduce((acc, item) => acc + (item.unitPrice.amount / 100) * item.quantity, 0)` | 53-55 | ❌ No — inline |
| `CartComponent.tsx` | `items.reduce((sum, item) => sum + (item.unitPrice.amount / 100) * item.quantity, 0)` | 21-24 | ❌ No — inline |
| `CartItems.tsx` | `(item.unitPrice.amount / 100) * item.quantity` per item | 115 | ❌ No — inline |

All three components independently convert cents→dollars via `/100` and compute totals. The `useUnifiedCart().summary` already provides `summary.total.amount` and `summary.subtotal.amount` in cents.

#### Description

Price calculations are duplicated across 3 components, each independently converting cents to dollars. This creates floating-point precision issues and violates DRY. The `useUnifiedCart().summary` already provides the correct total in cents.

#### Implementation Steps

**Step 1: Add `formatCurrency` to `cart-utils.ts`**

```ts
// ADD to src/modules/cart/cart-utils.ts (after existing utilities)

/* =========================================================
   Currency Formatting
   ========================================================= */

/**
 * Convert cents (minor units) to dollars (major units) safely.
 * Uses Math.round to avoid floating-point drift.
 */
export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Format a cent amount as a localized currency string.
 * @param cents - Amount in minor units (e.g., 1999 for $19.99)
 * @param currency - ISO 4217 currency code (default: "USD")
 */
export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(centsToDollars(cents));
}
```

**Step 2: Update `CartProducts.tsx`**

```tsx
// CURRENT (lines 3, 15, 53-55, 77-81, 129-131, 133-137, 148-149)
import { useUnifiedCart } from "@/src/modules/cart";
// ...
const { items, removeItem, itemCount } = useUnifiedCart();
// ...
const totalPrice = items.reduce((acc, item) => {
  return acc + (item.unitPrice.amount / 100) * item.quantity;
}, 0);
// ...
${totalPrice > 10000 ? totalPrice.toString().slice(0, 5) + "..." : totalPrice.toFixed(2)}
// ...
{(item.unitPrice.amount / 100).toFixed(2)}
// ...
${((item.unitPrice.amount / 100) * item.quantity).toFixed(2)}
// ...
${totalPrice.toFixed(2)}

// AFTER
import { useUnifiedCart, formatCurrency, centsToDollars } from "@/src/modules/cart";
// ...
const { items, removeItem, itemCount, summary } = useUnifiedCart();
// ...
// DELETE the totalPrice calculation entirely
// Use summary.total.amount for the total
// ...
// For the navbar total display:
{formatCurrency(summary.total.amount)}
// ...
// For per-item unit price:
{formatCurrency(item.unitPrice.amount)}
// ...
// For per-item subtotal:
{formatCurrency(item.unitPrice.amount * item.quantity)}
// ...
// For mini cart total:
{formatCurrency(summary.total.amount)}
```

**Step 3: Update `CartComponent.tsx`**

```tsx
// CURRENT (lines 5, 12, 21-24, 27, 53, 112)
import { useUnifiedCart } from "@/src/modules/cart";
// ...
const { items } = useUnifiedCart();
// ...
const subtotal = items.reduce(
  (sum, item) => sum + (item.unitPrice.amount / 100) * item.quantity,
  0,
);
const total = subtotal;
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
// ...
${subtotal.toFixed(2)}
// ...
${total.toFixed(2)}

// AFTER
import { useUnifiedCart, formatCurrency } from "@/src/modules/cart";
// ...
const { items, itemCount, summary } = useUnifiedCart();
// ...
// DELETE subtotal, total, totalItems calculations
// Use summary.subtotal.amount and summary.total.amount
// ...
// Subtotal display:
{formatCurrency(summary.subtotal.amount)}
// ...
// Total display:
{formatCurrency(summary.total.amount)}
```

**Step 4: Update `CartItems.tsx`**

```tsx
// CURRENT (lines 3, 12, 115, 151, 158, 207)
import { useUnifiedCart } from "@/src/modules/cart";
// ...
const { items, updateQuantity, removeItem, clearItems, isLoading, error } = useUnifiedCart();
// ...
const itemSubtotal = (item.unitPrice.amount / 100) * item.quantity;
// ...
${(item.unitPrice.amount / 100).toFixed(2)}
// ...
${(item.unitPrice.amount / 100).toFixed(2)}
// ...
${itemSubtotal.toFixed(2)}

// AFTER
import { useUnifiedCart, formatCurrency } from "@/src/modules/cart";
// ...
const { items, updateQuantity, removeItem, clearItems, isLoading, error } = useUnifiedCart();
// ...
const itemSubtotal = item.unitPrice.amount * item.quantity; // keep in cents
// ...
{formatCurrency(item.unitPrice.amount)}
// ...
{formatCurrency(item.unitPrice.amount)}
// ...
{formatCurrency(itemSubtotal)}
```

#### Verification

- [ ] Price displays match before/after changes (e.g., $19.99 still shows $19.99)
- [ ] No floating-point precision issues (e.g., $19.99 × 3 = $59.97, not $59.970000000000006)
- [ ] Currency formatting is consistent across mini cart, cart page, and cart items
- [ ] Edge case: items with different currencies handled correctly (existing `CartSummary.currency` field)

---

### Task 3.3 — Add Loading State for Authenticated Remove (Issue #7) 🔄 PENDING

**Priority:** P2 — LOW
**Effort:** S (~2-3h)
**Files to modify:** `CartProducts.tsx`, `CartItems.tsx`

#### Current State Analysis

| Component | Remove button shows loading? | Toast timing | Uses `isPending`? |
|---|---|---|---|
| `CartProducts.tsx` | ❌ No | Fires before API confirms (line 115) | ❌ No |
| `CartItems.tsx` | ❌ No (2 remove buttons: desktop line 210, mobile line 224) | Fires before API confirms | ❌ No |

#### Description

When an authenticated user clicks remove, there's no visual feedback during the API call. The toast fires optimistically before the server confirms. If the API fails, the item reappears but the user already saw "Removed from cart."

#### Implementation Steps

**Step 1: Update `CartProducts.tsx`**

```tsx
// CURRENT (line 15)
const { items, removeItem, itemCount } = useUnifiedCart();

// AFTER
const { items, removeItem, itemCount, isPending } = useUnifiedCart();

// CURRENT (lines 111-120) — remove button
<div
  onClick={(e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(item.productId);
    toast.info("Removed from cart");
  }}
  className="group w-4 h-4 cursor-pointer absolute top-0 right-0 rounded-full bg-gray-200 hover:bg-gray-400 hover:scale-110 duration-300 flex items-center justify-center"
>
  <FaTimes className="size-3 text-icon-color group-hover:text-white duration-300" />
</div>

// AFTER
<div
  onClick={(e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPending) {
      removeItem(item.productId);
      toast.info("Removed from cart");
    }
  }}
  className={`group w-4 h-4 cursor-pointer absolute top-0 right-0 rounded-full duration-300 flex items-center justify-center ${
    isPending
      ? "bg-gray-100 pointer-events-none"
      : "bg-gray-200 hover:bg-gray-400 hover:scale-110"
  }`}
>
  {isPending ? (
    <svg className="size-3 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    <FaTimes className="size-3 text-icon-color group-hover:text-white duration-300" />
  )}
</div>
```

**Step 2: Update `CartItems.tsx` — Desktop remove button (line 209-218)**

```tsx
// CURRENT (line 12)
const { items, updateQuantity, removeItem, clearItems, isLoading, error } = useUnifiedCart();

// AFTER
const { items, updateQuantity, removeItem, clearItems, isLoading, error, isPending } = useUnifiedCart();

// CURRENT (lines 209-218) — desktop remove button
<button
  onClick={() => {
    removeItem(item.productId);
    toast.info("Removed from cart");
  }}
  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
  aria-label={`Remove ${item.productName} from cart`}
>
  <FiX className="h-4 w-4" />
</button>

// AFTER
<button
  onClick={() => {
    if (!isPending) {
      removeItem(item.productId);
      toast.info("Removed from cart");
    }
  }}
  disabled={isPending}
  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 disabled:pointer-events-none"
  aria-label={`Remove ${item.productName} from cart`}
>
  {isPending ? (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : (
    <FiX className="h-4 w-4" />
  )}
</button>
```

**Step 3: Update `CartItems.tsx` — Mobile remove button (lines 222-233)**

Apply the same pattern as the desktop button:
- Add `disabled={isPending}` 
- Show spinner when `isPending`
- Guard `onClick` with `if (!isPending)`

#### Verification

- [ ] Authenticated user clicks remove → spinner appears briefly
- [ ] After API success → item removed, toast shown
- [ ] If API fails → item reappears, error toast shown (from Task 2.2)
- [ ] Guest user remove → no spinner (synchronous Zustand update, `isPending` is false)
- [ ] Button is not clickable during pending state
- [ ] Multiple rapid clicks don't trigger multiple API calls

---

### Phase 3 Deliverables Checklist

- [ ] `CartComponent.tsx` — uses `itemCount` from `useUnifiedCart()` instead of manual `reduce` (Task 3.1)
- [ ] `cart-utils.ts` — `formatCurrency()` and `centsToDollars()` utilities added (Task 3.2)
- [ ] `CartProducts.tsx` — uses `summary.total.amount` + `formatCurrency()` for all prices (Task 3.2)
- [ ] `CartComponent.tsx` — uses `summary.subtotal.amount` + `formatCurrency()` for prices (Task 3.2)
- [ ] `CartItems.tsx` — uses `formatCurrency()` for per-item prices (Task 3.2)
- [ ] `CartProducts.tsx` — remove button shows spinner when `isPending` (Task 3.3)
- [ ] `CartItems.tsx` — both desktop and mobile remove buttons show spinner when `isPending` (Task 3.3)
- [ ] Toast notifications are accurate (not premature) (Task 3.3)
- [ ] No TypeScript errors after changes
- [ ] `formatCurrency` exported from `src/modules/cart/index.ts`

---

## 6. Testing Strategy

### Unit Tests

| Test | File | What to Verify |
|---|---|---|
| `removeGuestItem` | `cart.store.ts` | Item removed from Zustand store |
| `selectGuestCartSummary` | `cart-selectors.ts` | Correct total quantity and amount |
| `toUnifiedFromGuestItem` | `unified-cart.hooks.ts` | Correct mapping of guest items |
| `formatCurrency` | `cart-utils.ts` | Correct cents→dollars conversion |
| `centsToDollars` | `cart-utils.ts` | No floating-point precision issues |

### Integration Tests

| Test | Scenario | Expected Result |
|---|---|---|
| Mini cart remove | Click remove in mini cart | Item removed, mini cart stays open |
| Badge accuracy | Add items with qty > 1 | Badge shows total quantity |
| Auth transition | Login while guest cart has items | Items migrate to server cart |
| Checkout flow | Complete Stripe checkout | Cart cleared only after payment |
| Error handling | Remove non-existent item | Error toast shown |

### Manual QA Checklist

- [ ] Guest user: add/remove/update items in mini cart
- [ ] Guest user: add/remove/update items in full cart page
- [ ] Authenticated user: same flows as guest
- [ ] Login with existing guest cart → items merge
- [ ] Logout → cart reverts to local state
- [ ] Checkout → Stripe redirect → success → cart cleared
- [ ] Checkout → browser crash → cart preserved
- [ ] Cross-tab sync (guest cart)

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation | Status |
|---|---|---|---|---|
| Auth state change causes stale cart data | Medium | High | Phase 2 Task 2.1 addresses this with reactive store | ✅ Mitigated |
| Cart clear timing breaks checkout flow | Medium | High | Phase 2 Task 2.3 includes fallback on success page | ✅ Mitigated |
| Guest cart migration loses items | Low | High | Test migration thoroughly; keep localStorage backup | ✅ Mitigated |
| Price calculation changes affect existing orders | Low | Medium | Only change display logic, not stored values | 🔄 Phase 3 |
| `e.stopPropagation` breaks other interactions | Very Low | Low | Test all mini cart interactions after change | ✅ Done |
| Zustand auth store adds complexity | Low | Medium | Keep store minimal; document clearly | ✅ Done |

---

## 8. Dependencies & Blocked Items

### Dependencies

| Task | Depends On | Reason | Status |
|---|---|---|---|
| Task 1.2 | Task 1.1 | Both modify `CartProducts.tsx` — apply in order | ✅ Done |
| Task 2.2 | Task 2.1 | Error handling may need reactive auth state | ✅ Done |
| Task 2.3 | Task 2.1 | Checkout flow may depend on correct auth state | ✅ Done |
| Task 3.1 | Task 1.2 | Standardize after badge is fixed | 🔄 Ready to start |
| Task 3.2 | Task 3.1 | Price centralization after count standardization | 🔄 Ready after 3.1 |
| Task 3.3 | Task 1.1, Task 2.2 | Loading state needs stopPropagation and error handling | ✅ Dependencies done |

### Blocked Items

- None — all Phase 3 tasks are unblocked

---

## 9. Acceptance Criteria

### Phase 1 — Done When ✅ COMPLETE

- [x] Mini cart stays open when remove button is clicked
- [x] Cart badge shows total quantity (sum of all item quantities)
- [x] No regressions in existing cart functionality
- [x] All changes pass TypeScript compilation

### Phase 2 — Done When ✅ COMPLETE

- [x] `useUnifiedCart` re-renders when auth state changes
- [x] Login/logout transitions correctly switch between guest/server cart
- [x] Authenticated remove shows error toast when item not found
- [x] Cart is NOT cleared before Stripe redirect
- [x] Cart IS cleared on success page after payment (fallback)
- [x] Success page shows empty cart after payment

### Phase 3 — Done When

- [ ] All cart components use same item count source
- [ ] Price calculations use centralized utility
- [ ] No floating-point precision issues in price display
- [ ] Remove button shows loading indicator for authenticated users
- [ ] Toast notifications are accurate (not premature)

---

## 10. Appendix — File Change Matrix

### Completed Changes (Phase 1 & 2)

| File | Change | Lines | Verified |
|---|---|---|---|
| `CartProducts.tsx` | Added `e.stopPropagation()` to remove button | 113 | ✅ |
| `CartProducts.tsx` | Destructured `itemCount`, replaced `items.length` | 15, 68-70 | ✅ |
| `cart-auth.store.ts` | Created Zustand auth store | New file (22 lines) | ✅ |
| `cart.transport.ts` | `setAuthAdapter()` syncs to Zustand store | 35 | ✅ |
| `unified-cart.hooks.ts` | Subscribes to `useCartAuthStore`, added error handling | 78, 140-141 | ✅ |
| `useCheckout.ts` | Removed `onBeforeRedirect` / cart clearing | Clean | ✅ |
| `PaymentSuccess.tsx` | Added cart clearing fallback on success | 70-78 | ✅ |

### Remaining Changes (Phase 3)

| File | Task | Change | Lines Affected |
|---|---|---|---|
| `cart-utils.ts` | 3.2 | Add `centsToDollars()` and `formatCurrency()` | New functions |
| `cart/index.ts` | 3.2 | Export `centsToDollars` and `formatCurrency` | ~93 |
| `CartComponent.tsx` | 3.1, 3.2 | Use `itemCount` + `formatCurrency()` | 12, 21-27, 50, 53, 112 |
| `CartProducts.tsx` | 3.2, 3.3 | Use `formatCurrency()` + add `isPending` loading state | 15, 53-55, 77-81, 111-120, 129-137, 148-149 |
| `CartItems.tsx` | 3.2, 3.3 | Use `formatCurrency()` + add `isPending` loading state | 12, 115, 151, 158, 207, 209-218, 222-233 |

### Required Export Updates

After implementing Task 3.2, update `src/modules/cart/index.ts`:

```ts
// ADD to existing exports (after line 93)
export { centsToDollars, formatCurrency } from "./cart-utils";
```

**Total files modified:** ~10 (including 1 new file)
**Total tasks:** 8 (5 done, 3 pending)
**Estimated effort remaining:** ~6-8 hours (Phase 3 only)

---

*This plan is based on the analysis in `reports/cart-logic-analysis.md`. Update this document as tasks are completed or requirements change.*
