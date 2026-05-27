# Cart Module

Logic-only portable cart module for Next.js projects. Handles domain types, transport, state, sync, and checkout orchestration — no UI.

## Files

```
cart.types.ts  — Domain types, DTOs, error contracts, store types
cart.api.ts    — Transport, adapters, endpoints, keys, mappers, services, selectors, API functions
cart.store.ts  — Pure Zustand store with guest cart persistence
cart.hooks.ts  — React Query hooks for cart queries and mutations
index.ts       — Public barrel exports
```

## Host Integration Checklist

### Required

- **TanStack Query provider** at app shell level (for `useCart`, `useCartSummary`, etc.)
- **Auth adapter** (optional if no authenticated cart): call `setAuthAdapter({ userId, isAuthenticated })` after auth state resolves
- **Cart transport** (optional; defaults to `globalRequest`): call `setCartTransport(customTransport)` for a custom HTTP layer

### Optional

- **Storage adapter** — override via `setStorageAdapter()` (defaults to `localStorage`)
- **Redirect adapter** — override via `setRedirectAdapter()` (defaults to `window.location.href`)
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
checkout.mutate({ returnUrl: "/orders" });

// Guest sync (call after login)
const { mutate: sync } = useSyncGuestCart();
sync();
```

## Adapter Contracts

```typescript
interface AuthAdapter {
  userId: string | null;
  isAuthenticated: boolean;
}

interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

interface RedirectAdapter {
  to(url: string): void;
  replace(url: string): void;
}
```

## Money

All monetary values are in **minor units** (cents). Display formatting is the host app's responsibility.

## Cart Store

The Zustand store (`useCartStore`) is **pure** — no side effects, no API calls, no toasts. It only holds:
- `guestItems` — persisted to `localStorage`
- `loading` — ephemeral UI coordination state (not persisted)
- `isHydrated` — flag set after guest cart loads from storage

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

**Type conversion** (`ProductType` → `GuestCartItem`):
```ts
import type { GuestCartItem } from "@/src/modules/cart";

function toGuestCartItem(product: ProductType): GuestCartItem {
  return {
    productId: String(product.id),
    productName: product.title,
    productSlug: product.title.toLowerCase().replace(/\s+/g, "-"),
    productImage: product.images[0] ?? product.thumbnail,
    unitPrice: { amount: Math.round(product.price * 100), currency: "usd" },
    quantity: 1,
    stock: product.stock,
    minimumQuantity: 1,
    maximumQuantity: 99,
  };
}
```
