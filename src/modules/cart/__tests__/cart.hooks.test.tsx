import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCartSummary,
  useCartCount,
  useCartActions,
  useSyncGuestCart,
  useGuestCart,
} from "../cart.hooks";
import { useCartStore } from "../cart.store";
import * as service from "../cart.service";
import * as invalidation from "../cart-invalidation";
import { toCart } from "../cart-mappers";
import type { Cart, CartDto, CartItemDto } from "../cart.types";

/* =========================================================
   Test setup
   ========================================================= */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockCartItemDto: CartItemDto = {
  id: "item-1",
  productId: "prod-1",
  productName: "Test Product",
  productSlug: "test-product",
  productImage: "/test.jpg",
  price: 1999,
  quantity: 2,
  stock: 10,
  minimumOrderQuantity: 1,
  maximumOrderQuantity: 99,
};

const mockCartDto: CartDto = {
  id: "cart-1",
  userId: "user-1",
  items: [mockCartItemDto],
  subtotal: 3998,
  total: 3998,
  currency: "usd",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockCart: Cart = toCart(mockCartDto);

beforeEach(() => {
  vi.restoreAllMocks();
  useCartStore.setState({
    guestItems: [],
    isHydrated: false,
  });
});

/* =========================================================
   useCartSummary — guest fallback tests
   ========================================================= */

describe("useCartSummary", () => {
  it("returns guest item summary when there are guest items", () => {
    act(() => {
      useCartStore.getState().addGuestItem({
        productId: "prod-1",
        productName: "Guest Item",
        productSlug: "guest-item",
        productImage: "/img.jpg",
        unitPrice: { amount: 1000, currency: "usd" },
        quantity: 3,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    const { result } = renderHook(() => useCartSummary(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.summary.itemCount).toBe(3);
    expect(result.current.summary.subtotal.amount).toBe(3000);
  });

  it("returns zero summary when no guest items or server cart", () => {
    const { result } = renderHook(() => useCartSummary(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.summary.itemCount).toBe(0);
    expect(result.current.summary.subtotal.amount).toBe(0);
  });
});

/* =========================================================
   useCartCount — guest fallback tests
   ========================================================= */

describe("useCartCount", () => {
  it("returns guest count when there are guest items", () => {
    act(() => {
      useCartStore.getState().addGuestItem({
        productId: "prod-1",
        productName: "Item",
        productSlug: "item",
        productImage: "",
        unitPrice: { amount: 500, currency: "usd" },
        quantity: 4,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    const { result } = renderHook(() => useCartCount(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.count).toBe(4);
  });

  it("returns zero count when no guest items", () => {
    const { result } = renderHook(() => useCartCount(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.count).toBe(0);
  });
});

/* =========================================================
   useGuestCart
   ========================================================= */

describe("useGuestCart", () => {
  it("returns empty state initially", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.summary.itemCount).toBe(0);
    expect(result.current.summary.subtotal.amount).toBe(0);
  });

  it("adds a guest item", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "Product 1",
        productSlug: "product-1",
        productImage: "/img.jpg",
        unitPrice: { amount: 2000, currency: "usd" },
        quantity: 1,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.items[0].productName).toBe("Product 1");
  });

  it("removes a guest item", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "Product 1",
        productSlug: "product-1",
        productImage: "/img.jpg",
        unitPrice: { amount: 2000, currency: "usd" },
        quantity: 1,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.removeItem("p1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("updates guest item quantity", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "Product 1",
        productSlug: "product-1",
        productImage: "/img.jpg",
        unitPrice: { amount: 2000, currency: "usd" },
        quantity: 1,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    act(() => {
      result.current.updateQuantity("p1", 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
    expect(result.current.summary.subtotal.amount).toBe(10000);
  });

  it("clears all guest items", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 2,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
      result.current.addItem({
        productId: "p2",
        productName: "P2",
        productSlug: "p2",
        productImage: "",
        unitPrice: { amount: 200, currency: "usd" },
        quantity: 1,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearItems();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("merges quantity when adding duplicate item", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 2,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 3,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it("clamps quantity to stock when merging duplicate items", () => {
    const { result } = renderHook(() => useGuestCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 8,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    act(() => {
      result.current.addItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 5,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(10);
  });
});

/* =========================================================
   useCartActions — addItem mutation
   ========================================================= */

describe("useCartActions.addItem", () => {
  it("calls addItemApi with the dto and completes mutation", async () => {
    const spy = vi.spyOn(service, "addItemApi").mockResolvedValue(mockCart);
    const invalidateSpy = vi.spyOn(invalidation, "invalidateCartDetail");

    const { result } = renderHook(() => useCartActions(), {
      wrapper: createWrapper(),
    });

    const dto = { productId: "prod-1", quantity: 1 };
    result.current.addItem.mutate(dto);

    await waitFor(() => expect(result.current.addItem.isLoading).toBe(false));
    expect(spy).toHaveBeenCalledWith(dto);
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("surfaces addItem API error", async () => {
    vi.spyOn(service, "addItemApi").mockRejectedValue({
      message: "Product out of stock",
      status: 400,
    });

    const { result } = renderHook(() => useCartActions(), {
      wrapper: createWrapper(),
    });

    result.current.addItem.mutate({ productId: "prod-1", quantity: 1 });

    await waitFor(() => expect(result.current.addItem.isLoading).toBe(false));
    expect(result.current.addItem.error).toBeDefined();
    expect(result.current.addItem.error?.message).toBe("Product out of stock");
  });
});

/* =========================================================
   useCartActions — removeItem mutation
   ========================================================= */

describe("useCartActions.removeItem", () => {
  it("calls removeItemApi with the item id", async () => {
    const spy = vi.spyOn(service, "removeItemApi").mockResolvedValue(mockCart);

    const { result } = renderHook(() => useCartActions(), {
      wrapper: createWrapper(),
    });

    result.current.removeItem.mutate("item-1");

    await waitFor(() =>
      expect(result.current.removeItem.isLoading).toBe(false),
    );
    expect(spy).toHaveBeenCalledWith("item-1");
  });
});

/* =========================================================
   useCartActions — clearCart mutation
   ========================================================= */

describe("useCartActions.clearCart", () => {
  it("clears guest items from store on success", async () => {
    vi.spyOn(service, "clearCartApi").mockResolvedValue({
      success: true,
      message: "Cart cleared",
    });

    act(() => {
      useCartStore.getState().addGuestItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 1,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    expect(useCartStore.getState().guestItems).toHaveLength(1);

    const { result } = renderHook(() => useCartActions(), {
      wrapper: createWrapper(),
    });

    result.current.clearCart.mutate();

    await waitFor(() =>
      expect(result.current.clearCart.isLoading).toBe(false),
    );

    expect(useCartStore.getState().guestItems).toHaveLength(0);
  });
});

/* =========================================================
   useSyncGuestCart
   ========================================================= */

describe("useSyncGuestCart", () => {
  it("clears guest items and updates query cache on success", async () => {
    vi.spyOn(service, "syncGuestCart").mockResolvedValue({
      success: true,
      cart: mockCart,
    });

    act(() => {
      useCartStore.getState().addGuestItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 2,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const { result } = renderHook(() => useSyncGuestCart(), {
      wrapper: function Wrapper({ children }: { children: ReactNode }) {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      },
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(useCartStore.getState().guestItems).toHaveLength(0);

    const cachedCart = queryClient.getQueryData(["cart", "detail"]);
    expect(cachedCart).toEqual(mockCart);
  });

  it("does not clear guest items on sync failure", async () => {
    vi.spyOn(service, "syncGuestCart").mockResolvedValue({
      success: false,
      errors: [{ productId: "p1", reason: "Server error" }],
    });

    act(() => {
      useCartStore.getState().addGuestItem({
        productId: "p1",
        productName: "P1",
        productSlug: "p1",
        productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 2,
        stock: 10,
        minimumQuantity: 1,
        maximumQuantity: 99,
      });
    });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const { result } = renderHook(() => useSyncGuestCart(), {
      wrapper: function Wrapper({ children }: { children: ReactNode }) {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      },
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(useCartStore.getState().guestItems).toHaveLength(1);
  });
});

/* =========================================================
   useCartActions — updateItem mutation
   ========================================================= */

describe("useCartActions.updateItem", () => {
  it("calls updateItemApi with itemId and dto", async () => {
    const spy = vi
      .spyOn(service, "updateItemApi")
      .mockResolvedValue(mockCart);

    const { result } = renderHook(() => useCartActions(), {
      wrapper: createWrapper(),
    });

    result.current.updateItem.mutate({
      itemId: "item-1",
      dto: { quantity: 3 },
    });

    await waitFor(() =>
      expect(result.current.updateItem.isLoading).toBe(false),
    );
    expect(spy).toHaveBeenCalledWith("item-1", { quantity: 3 });
  });
});
