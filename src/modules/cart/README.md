# Cart Module

Logic-only portable cart module for Next.js projects. Handles domain types, transport, state, sync, and checkout orchestration — no UI.

## Files

```
cart.types.ts       — Domain types, DTOs, error contracts
cart.transport.ts   — Transport layer, adapters (auth, storage, redirect), error normalization
cart.endpoints.ts   — Backend endpoint constants
cart.keys.ts        — React Query key factory
cart-mappers.ts     — DTO -> domain mappers
cart-selectors.ts   — Pure derived state selectors
cart-utils.ts       — Money utilities, quantity validation, merge helpers
cart.service.ts     — API functions, sync service, checkout service
cart-invalidation.ts — Query cache invalidation helpers
cart.store.ts       — Pure Zustand store with guest cart persistence
cart.hooks.ts       — React Query hooks for cart queries and mutations
cart.api.ts         — Backward-compatible re-export layer (prefer specific imports)
index.ts            — Public barrel exports
adapters/           — Generic product adapter interface + host-app adapters
__tests__/          — Unit tests
```

## Host Integration Checklist

### Required

- **TanStack Query provider** at app shell level (for `useCart`, `useCartSummary`, etc.)
- **Cart transport** — defaults to `fetch`-based transport; call `setCartTransport(customTransport)` for a custom HTTP layer
- **Auth adapter** (optional if no authenticated cart): call `setAuthAdapter({ userId, isAuthenticated, getToken })` after auth state resolves

### Optional

- **Storage adapter** — override via `setStorageAdapter()` (defaults to `localStorage`, lazy-initialized)
- **Redirect adapter** — override via `setRedirectAdapter()` (defaults to `window.location.href`)
- **Product adapter** — implement `ProductAdapter<T>` to convert your product types to `GuestCartItem`
- **Notifications** — wire `useCartActions` mutation callbacks to your toast system

## Usage

```tsx
import { useCart, useCartActions, useCartSummary, setAuthAdapter } from "@/src/modules/cart";

// Wire auth once
const { user } = useAuth();
useEffect(() => {
  setAuthAdapter({ userId: user?.id ?? null, isAuthenticated: !!user });
}, [user]);

// Read cart
const { data: cart, isLoading } = useCart();
const { summary } = useCartSummary();

// Mutate cart
const { addItem, removeItem, checkout } = useCartActions();
addItem.mutate({ productId: "abc", quantity: 1 });
checkout.mutate({ successUrl: "/orders/success", cancelUrl: "/cart" });

// Guest sync (call after login)
const { mutate: sync } = useSyncGuestCart();
sync();
```

## Adapter Contracts

### Transport

```typescript
interface Transport {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body?: unknown): Promise<T>;
  patch<T>(endpoint: string, body?: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}
```

### Auth

```typescript
interface AuthAdapter {
  userId: string | null;
  isAuthenticated: boolean;
  getToken?: () => Promise<string | null>;
}
```

### Storage

```typescript
interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}
```

### Redirect

```typescript
interface RedirectAdapter {
  to(url: string): void;
  replace(url: string): void;
}
```

### Product

```typescript
interface ProductAdapter<T> {
  getId: (product: T) => string;
  getName: (product: T) => string;
  getSlug: (product: T) => string;
  getImage: (product: T) => string;
  getPrice: (product: T) => Money;
  getStock: (product: T) => number;
  getMinQuantity?: (product: T) => number;
  getMaxQuantity?: (product: T) => number;
}
```

## Money

All monetary values are in **minor units** (cents). Display formatting is the host app's responsibility.

## Cart Store

The Zustand store (`useCartStore`) is **pure** — no side effects, no API calls, no toasts, no loading state. It only holds:
- `guestItems` — persisted to `localStorage`
- `isHydrated` — flag set after guest cart loads from storage

Cross-tab sync is handled via `storage` event listener.

## File Responsibilities

| File | Responsibility |
|---|---|
| `cart.types.ts` | All type definitions and constants |
| `cart.transport.ts` | HTTP transport, adapters, error normalization |
| `cart.endpoints.ts` | Backend route strings |
| `cart.keys.ts` | React Query cache keys |
| `cart-mappers.ts` | DTO to domain object conversion |
| `cart-selectors.ts` | Pure derived state (summaries, counts, warnings) |
| `cart-utils.ts` | Money math, quantity validation, merge logic |
| `cart.service.ts` | API functions, sync orchestration, checkout |
| `cart-invalidation.ts` | Query cache invalidation helpers |
| `cart.store.ts` | Zustand store for guest cart persistence |
| `cart.hooks.ts` | React Query hooks for consumers |
| `cart.api.ts` | Backward-compatible re-exports |
| `index.ts` | Public API barrel |

## Migration from Legacy CartStore

The old `app/store/CartStore.ts` used `ProductType` objects with `number` IDs and had side effects (toasts in store).

### Quick mapping

| Legacy method | New module equivalent |
|---|---|
| `cartItems` | `useGuestCart().items` (guest) or `useCart().data?.items` (auth) |
| `addToCart(product)` | `useGuestCart().addItem(guestItem)` or `useCartActions().addItem.mutate(dto)` |
| `removeFromCart(id)` | `useGuestCart().removeItem(productId)` or `useCartActions().removeItem.mutate(itemId)` |
| `increaseQuantity(product)` | `useGuestCart().updateQuantity(productId, qty + 1)` |
| `decreaseQuantity(id)` | `useGuestCart().updateQuantity(productId, qty - 1)` |
| `clearCart()` | `useGuestCart().clearItems()` or `useCartActions().clearCart.mutate()` |

**Type conversion** using the generic adapter:
```ts
import { createGuestCartItemFromProduct, type ProductAdapter } from "@/src/modules/cart";

const adapter: ProductAdapter<ProductType> = {
  getId: (p) => String(p.id),
  getName: (p) => p.title,
  getSlug: (p) => p.title.toLowerCase().replace(/\s+/g, "-"),
  getImage: (p) => p.images[0] ?? p.thumbnail ?? "",
  getPrice: (p) => ({ amount: Math.round(p.price * 100), currency: "usd" }),
  getStock: (p) => p.stock,
  getMinQuantity: (p) => p.minimumOrderQuantity ?? 1,
  getMaxQuantity: () => 99,
};

const guestItem = createGuestCartItemFromProduct(product, adapter, 1);
```
