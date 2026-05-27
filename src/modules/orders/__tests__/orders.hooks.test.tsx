import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCreateOrder,
  useUserOrders,
  useOrderDetail,
  useCancelOrder,
  useAdminOrders,
  useAdminOrderDetail,
  useUpdateOrderStatus,
  useOrderStats,
  useUserOrdersAdmin,
} from "../orders.hooks";
import * as api from "../orders.api";
import type { Order, OrderListResponse, OrderStats } from "../orders.types";
import { OrderStatus, PaymentStatus } from "../orders.types";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockOrder: Order = {
  id: "ord-1",
  orderNumber: "ORD-001",
  userId: "usr-1",
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      productName: "Test Product",
      productSlug: "test-product",
      productImage: "/img.jpg",
      unitPrice: { amount: 1000, currency: "usd" },
      quantity: 2,
      subtotal: { amount: 2000, currency: "usd" },
    },
  ],
  subtotal: { amount: 2000, currency: "usd" },
  shippingCost: { amount: 500, currency: "usd" },
  tax: { amount: 200, currency: "usd" },
  total: { amount: 2700, currency: "usd" },
  currency: "usd",
  status: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PENDING,
  shippingAddress: {
    fullName: "John Doe",
    addressLine1: "123 Main St",
    city: "New York",
    postalCode: "10001",
    country: "US",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockListResponse: OrderListResponse = {
  data: [mockOrder],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const mockStats: OrderStats = {
  totalOrders: 100,
  totalRevenue: { amount: 5000000, currency: "usd" },
  pendingOrders: 10,
  processingOrders: 5,
  shippedOrders: 3,
  cancelledOrders: 2,
  refundedOrders: 1,
  averageOrderValue: { amount: 5000, currency: "usd" },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useCreateOrder", () => {
  it("calls createOrderApi with the DTO", async () => {
    const spy = vi.spyOn(api, "createOrderApi").mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      items: [{ productId: "prod-1", quantity: 2 }],
      shippingAddress: {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        city: "New York",
        postalCode: "10001",
        country: "US",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({
      items: [{ productId: "prod-1", quantity: 2 }],
      shippingAddress: {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        city: "New York",
        postalCode: "10001",
        country: "US",
      },
    });
  });

  it("surfaces error when API fails", async () => {
    vi.spyOn(api, "createOrderApi").mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      items: [{ productId: "prod-1", quantity: 1 }],
      shippingAddress: {
        fullName: "John",
        addressLine1: "123 St",
        city: "NY",
        postalCode: "10001",
        country: "US",
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network error");
  });
});

describe("useUserOrders", () => {
  it("fetches user order list", async () => {
    vi.spyOn(api, "getUserOrdersApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useUserOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockListResponse);
  });

  it("fetches with custom params", async () => {
    const spy = vi.spyOn(api, "getUserOrdersApi").mockResolvedValue(mockListResponse);

    renderHook(() => useUserOrders({ page: 2, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("returns empty data when no orders exist", async () => {
    vi.spyOn(api, "getUserOrdersApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useUserOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
    expect(result.current.data?.meta.total).toBe(0);
  });
});

describe("useOrderDetail", () => {
  it("fetches order by id", async () => {
    vi.spyOn(api, "getOrderByIdApi").mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useOrderDetail("ord-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrder);
  });

  it("is disabled when id is undefined", async () => {
    const spy = vi.spyOn(api, "getOrderByIdApi");

    const { result } = renderHook(() => useOrderDetail(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("is disabled when id is empty string", async () => {
    const spy = vi.spyOn(api, "getOrderByIdApi");

    const { result } = renderHook(() => useOrderDetail(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useCancelOrder", () => {
  it("calls cancelOrderApi with the id", async () => {
    const spy = vi.spyOn(api, "cancelOrderApi").mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.CANCELLED,
    });

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("ord-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("ord-1");
  });
});

describe("useAdminOrders", () => {
  it("fetches admin order list", async () => {
    vi.spyOn(api, "getAdminOrdersApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useAdminOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockListResponse);
  });

  it("uses admin-specific query key", async () => {
    const spy = vi.spyOn(api, "getAdminOrdersApi").mockResolvedValue(mockListResponse);

    renderHook(() => useAdminOrders({ status: OrderStatus.PENDING }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});

describe("useAdminOrderDetail", () => {
  it("fetches admin order by id", async () => {
    vi.spyOn(api, "getAdminOrderByIdApi").mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useAdminOrderDetail("ord-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrder);
  });

  it("is disabled when id is undefined", async () => {
    const spy = vi.spyOn(api, "getAdminOrderByIdApi");
    renderHook(() => useAdminOrderDetail(undefined), { wrapper: createWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useUpdateOrderStatus", () => {
  it("calls updateOrderStatusApi with id and dto", async () => {
    const spy = vi.spyOn(api, "updateOrderStatusApi").mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.CONFIRMED,
    });

    const { result } = renderHook(() => useUpdateOrderStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "ord-1", dto: { status: OrderStatus.CONFIRMED } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("ord-1", { status: OrderStatus.CONFIRMED });
  });
});

describe("useOrderStats", () => {
  it("fetches order stats", async () => {
    vi.spyOn(api, "getOrderStatsApi").mockResolvedValue(mockStats);

    const { result } = renderHook(() => useOrderStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStats);
  });
});

describe("useUserOrdersAdmin", () => {
  it("returns orders, meta, and loading state", async () => {
    vi.spyOn(api, "getUserOrdersApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useUserOrdersAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orders).toEqual([mockOrder]);
    expect(result.current.meta).toEqual(mockListResponse.meta);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty orders array when no data", async () => {
    vi.spyOn(api, "getUserOrdersApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useUserOrdersAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orders).toEqual([]);
  });
});
