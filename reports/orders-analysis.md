# Architectural, Logical, and Performance Audit Report: `src/modules/orders`

This report provides a comprehensive analysis of the `@src/modules/orders` module in the Cypher Frontend project. It identifies critical architectural deviations, logic bugs, performance bottlenecks, and design/UX opportunities, and designs enterprise-grade solutions for each.

---

## 1. Executive Summary

An in-depth code audit of the `src/modules/orders` module reveals that while the core order listing, creation, and detail views are functional, they suffer from several architectural inconsistencies, performance risks, and UX shortcomings.

### Key Findings
1. **Duplicate Implementation / Dead Code (High Severity):** There are two parallel and out-of-sync directory structures inside the module: a flat structure at the root of `src/modules/orders` and a directory-based modular structure (`api/`, `contracts/`, `utils/`). The flat structure is the one currently imported and executed, leaving the modular directories as dead code that confuses developers and bloats the source tree.
2. **Custom Polling Anti-Pattern (High Severity):** The custom `useOrderPolling` hook uses a manual `setInterval` to invalidate React Query caches. This bypasses React Query's highly optimized native polling mechanism (`refetchInterval`), leaks memory, fails to handle page-unfocus/offline states, and continues polling indefinitely even after orders reach final states like `DELIVERED` or `CANCELLED`.
3. **Plain Object Error Throwing (Medium-High Severity):** The HTTP transport layer throws raw JavaScript objects rather than instances of `Error`. Since React Query hooks expect standard `Error` types, this mismatch can lead to silent failures, typing issues, and uncaught exceptions when hooks try to access properties like `error.message`.
4. **Hardcoded Money Formatting (Medium Severity):** Money values are manually divided by 100 (`amount / 100`) and formatted with a hardcoded `$` sign directly inside UI components. This ignores multi-currency setups (such as zero-decimal currencies like JPY) and breaks localized formatting standards.
5. **Basic UX / Lack of Premium Aesthetics (Medium Severity):** The pages use standard Tailwind grids without animations, skeletons, or modern visual elements. In accordance with the project's premium design requirements, the UI needs a sleek glassmorphism aesthetic, smooth list entries, and responsive state animations.

---

## 2. Issue Matrix and Classification

| ID | Issue Description | Category | Severity | Target File(s) |
| :--- | :--- | :--- | :--- | :--- |
| **ARC-01** | Duplicate codebase structures (root flat files vs unused subdirectories). | Architecture | **High** | `src/modules/orders/` |
| **PERF-01** | Custom manual polling via `setInterval` inside `useOrderPolling`. | Performance | **High** | `orders.hooks.ts` |
| **LOG-01** | API transport throws plain objects instead of `Error` instances. | Logic | **High** | `orders.api.ts` |
| **LOG-02** | Misleading admin hook (`useUserOrdersAdmin` wraps user endpoint). | Logic / Security | **Medium** | `orders.hooks.ts` |
| **LOG-03** | Direct money division `/ 100` and hardcoded `$` currency symbol in UI. | Logic | **Medium** | `OrdersPage.tsx`, `OrderDetailPage.tsx` |
| **PERF-02** | Standard HTML `<img>` tags instead of Next.js optimized `<Image>` components. | Performance | **Medium** | `OrderDetailPage.tsx` |
| **UX-01** | Basic, static UI styling with no animations, transitions, or skeletons. | UX / Design | **Medium** | `OrdersPage.tsx`, `OrderDetailPage.tsx` |
| **UX-02** | Mutations (e.g. order cancel) fail silently without visual toast notifications. | UX / Logic | **Medium** | `OrdersPage.tsx` |

---

## 3. In-Depth Issue Breakdown & Analysis

### ARC-01: Duplicate Codebase Structures
* **Symptom:** The directory contains a flat structure at the root:
  * `orders.api.ts`, `orders.hooks.ts`, `orders.store.ts`, `orders.types.ts`
  And a subdirectory structure:
  * `api/orders.api.ts`, `api/orders.endpoints.ts`, `api/orders.transport.ts`
  * `contracts/order.types.ts`, `contracts/order-status.ts`
  * `utils/normalize-order.ts`, `utils/money.ts`
* **Impact:** The application imports exclusively from the root flat files. The subdirectory structure is entirely dead code that duplicates logic (e.g., `toOrder` in `orders.api.ts` vs `utils/normalize-order.ts`). This violates the clean architecture rules outlined in `AGENTS.md` and causes confusion.
* **Resolution:** Clean up the codebase by migrating all active logic to the modular subdirectory structure (`api/`, `hooks/`, `store/`, `types/`, `constants/`, `utils/`) as recommended by the repository's modular guidelines, updating the index file to export from this clean layout, and deleting the redundant duplicate files.

### PERF-01: Custom Polling Anti-Pattern (`useOrderPolling`)
* **Symptom:**
  ```typescript
  export function useOrderPolling(id: string | undefined, enabled = false) {
    ...
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
    }, POLL_INTERVAL);
    ...
  }
  ```
* **Impact:**
  1. Bypasses React Query's `refetchInterval` optimizations.
  2. Does not automatically pause when the tab goes out of focus or when the user goes offline.
  3. **Wasted Bandwidth/Server load:** It will keep polling forever even if the order is completed (`DELIVERED`, `CANCELLED`, `REFUNDED`).
* **Resolution:** Refactor `useOrderDetail` to dynamically determine the `refetchInterval` based on the order status, returning zero when a terminal state is reached.

### LOG-01: Plain Object Error Throwing
* **Symptom:**
  ```typescript
  async function transportRequest<TResult = any>(...) {
    const res = await globalRequest({ endpoint, method, body });
    if (!res.success) {
      throw { message: res.message, status: res.statusCode ?? 500 } satisfies OrderApiError;
    }
    return res.data as TResult;
  }
  ```
* **Impact:** React Query and Vitest test suites expect throwing standard `Error` objects. Throwing a plain object causes TypeScript mismatches (e.g., `Error` type in hooks) and crashes if components run checks like `error instanceof Error` or attempt to read custom properties without proper typing.
* **Resolution:** Create a dedicated subclass `class OrderApiError extends Error` containing `status` and `errors` fields, throw it inside `transportRequest`, and leverage `normalizeOrderError` properly.

### LOG-02: Misleading Admin Hook Name
* **Symptom:**
  ```typescript
  export function useUserOrdersAdmin(params: OrderQueryParams = {}) {
    const list = useUserOrders(params);
    return {
      orders: list.data?.data ?? [],
      ...
    };
  }
  ```
* **Impact:** The hook contains the suffix `Admin` but internally queries the **customer** `/api/orders` endpoint via `useUserOrders` instead of the administrator endpoint `/api/admin/orders` via `useAdminOrders`. This is highly misleading and presents a potential access-control vulnerability or data leak risk.
* **Resolution:** Rename or correct the hook to use `useAdminOrders` internally or deprecate it in favor of explicit `useUserOrders` and `useAdminOrders` hooks.

### LOG-03: Hardcoded Money Formatting
* **Symptom:**
  ```typescript
  <span>Total</span>
  <span>${(order.total.amount / 100).toFixed(2)} {order.total.currency}</span>
  ```
* **Impact:** Hardcoded `/ 100` division assumes USD/EUR (cents-based). In zero-decimal currencies (like Japanese Yen), dividing by 100 displays incorrect values. Hardcoded `$` symbols look unpolished for non-USD currencies (e.g. displaying `$15.00 EUR`).
* **Resolution:** Implement a centralized utility function `formatMoney` utilizing the standard `Intl.NumberFormat` API, which respects the order's specific currency code and localized decimals.

### PERF-02: Standard HTML `<img>` in Next.js
* **Symptom:** `<img src={item.productImage} alt={item.productName} ... />` inside `OrderDetailPage.tsx`.
* **Impact:** Standard images lack lazy-loading, automatic webp compression, resizing, and layout shift protection, resulting in lower Lighthouse/Core Web Vitals scores.
* **Resolution:** Standardize on Next.js `<Image />` component with custom aspect-ratio container and fallback placeholders for empty image paths.

### UX-01: Basic, Static Styling
* **Symptom:** Simple borders, flat colors, standard cards, spin loader.
* **Impact:** Fails to deliver the modern, "wow" aesthetic mandated by the project's development criteria.
* **Resolution:** Revamp components to feature sleek glassmorphism panels, soft gradients, modern state badges with customized indicators, and fluid animated entries using `framer-motion`.

---

## 4. Solid Solutions & Code Diffs

Here are the concrete refactored files and architectural replacements.

### 4.1. Clean Architecture Migration (File Structure)

To fulfill `AGENTS.md` guidelines, we will restructure the orders module into the following modular tree.

```
src/modules/orders/
├── api/
│   ├── orders.api.ts         # Main active API layer (formerly orders.api.ts at root)
│   ├── checkout.api.ts       # Stripe checkout-related API integrations
│   ├── orders.endpoints.ts   # Unified API URL routing paths
│   └── orders.transport.ts   # Axios/Fetch client integration wrapper
├── hooks/
│   ├── useOrders.hook.ts     # useUserOrders, useAdminOrders, useCancelOrder hooks
│   └── useOrderPolling.hook.ts # Optimized terminal-state-aware React Query polling
├── store/
│   └── orders.store.ts       # Zustand order filters & caching state
├── utils/
│   ├── money.ts              # Intelligent multi-currency money formatting & scales
│   ├── normalize-order.ts    # JSON-to-Domain mapping layer
│   └── status-guards.ts      # CanTransition status constraints
├── types/
│   └── orders.types.ts       # Unified TypeScript data interfaces & enums
└── index.ts                  # Clean single public module entry-point
```

> [!NOTE]
> All duplicate flat files at the root (`orders.api.ts`, `orders.hooks.ts`, `orders.store.ts`, `orders.types.ts`) will be successfully refactored and merged into this directory structure.

---

### 4.2. Concrete Code Implementations

#### Corrected Error Modeling (`src/modules/orders/utils/error.ts`)
Create a custom error subclass to avoid throwing plain objects:

```typescript
export class OrderError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status = 500, errors?: Record<string, string[]>) {
    super(message);
    this.name = "OrderError";
    this.status = status;
    this.errors = errors;
    
    // Ensure correct prototype chain in TS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function normalizeOrderError(error: unknown): OrderError {
  if (error instanceof OrderError) return error;

  if (error && typeof error === "object" && "message" in error) {
    const raw = error as any;
    return new OrderError(
      raw.message ?? "An unexpected error occurred",
      raw.status ?? 500,
      raw.errors
    );
  }
  return new OrderError("An unexpected error occurred", 500);
}
```

Then update `transportRequest` in `src/modules/orders/api/orders.api.ts` to throw this standard error:
```typescript
async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw new OrderError(
      res.message ?? "API Request Failed", 
      res.statusCode ?? 500
    );
  }
  return res.data as TResult;
}
```

---

#### Centralized Money Formatter (`src/modules/orders/utils/money.ts`)
Create an dynamic formatter that handles currencies properly without hardcoding `/ 100`:

```typescript
import type { Money } from "../types/orders.types";

/**
 * List of zero-decimal currencies (values are already in main units)
 */
const ZERO_DECIMAL_CURRENCIES = ["jpy", "krw", "vnd", "clp"];

/**
 * Returns the decimal divisor factor for a currency.
 */
export function getCurrencyDivisor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase()) ? 1 : 100;
}

/**
 * Format a Money object using localized formatting API.
 */
export function formatMoney(money: Money, locale = "en-US"): string {
  const divisor = getCurrencyDivisor(money.currency);
  const units = money.amount / divisor;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currency.toUpperCase(),
    }).format(units);
  } catch (error) {
    // Fallback if the browser doesn't support the currency
    return `${money.currency.toUpperCase()} ${units.toFixed(2)}`;
  }
}
```

---

#### Terminal-State-Aware Hook Polling (`src/modules/orders/hooks/useOrders.hook.ts`)
Refactor React Query hooks to automate polling without manual intervals and disable requests on terminal order statuses:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatus } from "../types/orders.types";
import { getOrderByIdApi } from "../api/orders.api";
import type { Order } from "../types/orders.types";

/**
 * Determines if an order status is a final, terminal state.
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED
  ].includes(status);
}

/**
 * Order Details Hook with intelligent terminal-state auto-polling.
 * If the order is active, it polls the backend every 10 seconds.
 * Once the status transitions to DELIVERED, CANCELLED, or REFUNDED, polling terminates automatically.
 */
export function useOrderDetail(id: string | undefined, autoPoll = false) {
  return useQuery<Order, Error>({
    queryKey: ["orders", "detail", id ?? ""],
    queryFn: () => getOrderByIdApi(id!),
    enabled: !!id,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchInterval: (query) => {
      if (!autoPoll) return false;
      const order = query.state.data;
      if (!order || isTerminalStatus(order.status)) {
        return false; // Stop polling completely
      }
      return 10 * 1000; // Poll active orders every 10 seconds
    },
    refetchIntervalInBackground: false, // Prevents battery and network drain when tab is inactive
  });
}
```

---

#### Premium Visual Experience Overhaul (`src/modules/orders/components/pages/OrdersPage.tsx`)
Incorporate dynamic lists (`framer-motion`), glassmorphic cards, polished indicator badges, skeleton views, and Toast notifications using `sonner`.

```tsx
"use client";

import { useState } from "react";
import { useUserOrders, useCancelOrder } from "../../hooks/useOrders.hook";
import { OrderStatus } from "../../types/orders.types";
import { formatMoney } from "../../utils/money";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "../../types/orders.types";

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useUserOrders({ page, limit: 10 });
  const { mutate: cancelOrder } = useCancelOrder();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (id: string, orderNumber: string) => {
    setCancellingId(id);
    cancelOrder(id, {
      onSuccess: () => {
        toast.success(`Order ${orderNumber} has been successfully cancelled.`);
      },
      onError: (err) => {
        toast.error(`Failed to cancel order: ${err.message}`);
      },
      onSettled: () => setCancellingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <div className="h-10 w-48 bg-zinc-800 animate-pulse rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 w-full border border-zinc-800 bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="p-6 border border-red-950 bg-red-950/20 rounded-2xl max-w-md mx-auto">
          <p className="text-red-400 font-medium">Failed to retrieve orders</p>
          <p className="text-sm text-red-500/80 mt-1">{error?.message}</p>
        </div>
      </div>
    );
  }

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">No orders found</h2>
        <p className="text-zinc-400 max-w-sm mx-auto">When you make purchases, your order history will be detailed here.</p>
      </div>
    );
  }

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case OrderStatus.CANCELLED:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case OrderStatus.PENDING:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Purchase History</h1>
          <p className="text-zinc-400 text-sm mt-1">Review, track, and manage your placed orders.</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order: Order, index: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/20 hover:shadow-2xl hover:shadow-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm font-semibold text-zinc-300 group-hover:text-primary transition-colors">
                    {order.orderNumber}
                  </p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} {order.items.length === 1 ? "item" : "items"}
                  </span>
                  <span className="font-bold text-zinc-200">
                    {formatMoney(order.total)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                {order.status === OrderStatus.PENDING && (
                  <button
                    onClick={() => handleCancel(order.id, order.orderNumber)}
                    disabled={cancellingId === order.id}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-95 disabled:opacity-50 transition-all duration-200"
                  >
                    {cancellingId === order.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        Cancelling...
                      </span>
                    ) : "Cancel Order"}
                  </button>
                )}
                
                <a
                  href={`/orders/${order.id}`}
                  className="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold rounded-lg text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-200"
                >
                  View Details
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
          >
            &larr; Previous
          </button>
          
          <span className="text-xs font-medium text-zinc-400">
            Page <span className="text-zinc-200 font-bold">{page}</span> of <span className="text-zinc-200 font-bold">{data.meta.totalPages}</span>
          </span>
          
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Architectural Clean-Up Step-by-Step Plan

To transition `@src/modules/orders` to the optimal structure, execute the following implementation phases:

### Phase 1: Subdirectory Merge
1. **Move Root Types**: Copy types from `/home/a-dev/projects/cypher/frontend/src/modules/orders/orders.types.ts` into `/home/a-dev/projects/cypher/frontend/src/modules/orders/contracts/order.types.ts` and merge.
2. **Move Root API Logic**: Copy `orders.api.ts` from root and merge its content with `src/modules/orders/api/orders.api.ts`.
3. **Move Root Hooks**: Relocate `orders.hooks.ts` into a new file `src/modules/orders/hooks/useOrders.hook.ts`. Update imports to fetch types from `../contracts/order.types` and api from `../api/orders.api`.
4. **Move Zustand Store**: Relocate `orders.store.ts` into a new file `src/modules/orders/store/orders.store.ts`.

### Phase 2: Internal Refactoring
1. Refactor error throws in `src/modules/orders/api/orders.api.ts` to utilize the new `OrderError` class.
2. Introduce the currency-divisor aware `formatMoney` function in `src/modules/orders/utils/money.ts`.
3. Update `useOrderDetail` in `src/modules/orders/hooks/useOrders.hook.ts` to support the auto-polling `refetchInterval` configuration.
4. Correct hook references (e.g. rename or replace `useUserOrdersAdmin`).

### Phase 3: Public Exports Re-routing (`index.ts`)
Update `src/modules/orders/index.ts` to export exclusively from the subdirectory components:
```typescript
// Component Page Views
export { OrdersPage } from "./components/pages/OrdersPage";
export { OrderDetailPage } from "./components/pages/OrderDetailPage";

// React Query Hooks
export {
  useCreateOrder,
  useUserOrders,
  useOrderDetail,
  useCancelOrder,
  useAdminOrders,
  useAdminOrderDetail,
  useUpdateOrderStatus,
  useOrderStats,
} from "./hooks/useOrders.hook";

// Zustand Store
export { useOrderFilterStore } from "./store/orders.store";

// Domain Types
export type {
  Order,
  OrderItem,
  OrderSummary,
  OrderListResponse,
  PaginationMeta,
  OrderStats,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryParams,
  ShippingAddress,
  Money,
} from "./contracts/order.types";

export { OrderStatus, PaymentStatus } from "./contracts/order.types";
```

### Phase 4: Dead Code Elimination
Once import integration is confirmed working, safely delete duplicate flat files at the root of `src/modules/orders/`:
* `orders.api.ts` (deleted)
* `orders.hooks.ts` (deleted)
* `orders.store.ts` (deleted)
* `orders.types.ts` (deleted)

---

## 6. Recommendations & Best Practices

1. **Standardize Money Formatting:** Make `formatMoney` the absolute default for printing prices in the UI. Ensure backend amounts are clearly labeled as cents (e.g., in TypeScript comments or type definitions) to prevent scaling errors.
2. **Mandate Next/Image components:** Avoid direct HTML `<img />` tags for external products. Next.js image loading ensures stable layout dimensions and keeps pages fast.
3. **Prefer React-Query Polling:** Never roll custom `setInterval` wrappers in React components to refresh data. Leveraging React Query configurations maintains synchronized states and respects page visibility cycles automatically.
4. **Mutations Feedback:** Equip every single user action mutation with a reactive `toast` notification to deliver instantaneous visual confirmation of success or failure.
