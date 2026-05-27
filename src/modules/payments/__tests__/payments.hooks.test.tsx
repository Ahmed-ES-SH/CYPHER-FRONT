import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCreatePaymentIntent,
  useConfirmPayment,
  usePaymentHistory,
  usePaymentTransaction,
  usePaymentMethods,
  usePaymentConfig,
  useAdminPaymentHistory,
  useAdminPaymentTransaction,
  useRefundPayment,
} from "../index";
import * as api from "../api/payments.api";
import type {
  PaymentTransaction,
  PaymentHistoryResponse,
  PaymentMethodOption,
  PaymentConfig,
  PaymentIntentResponse,
} from "../types/payments.types";
import { PaymentMethod, PaymentStatus } from "../types/payments.types";

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

const mockTransaction: PaymentTransaction = {
  id: "txn-1",
  orderId: "ord-1",
  orderNumber: "ORD-001",
  method: PaymentMethod.STRIPE,
  status: PaymentStatus.SUCCEEDED,
  amount: { amount: 5000, currency: "usd" },
  fee: { amount: 150, currency: "usd" },
  netAmount: { amount: 4850, currency: "usd" },
  stripePaymentIntentId: "pi_123",
  stripeClientSecret: "secret_123",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockHistoryResponse: PaymentHistoryResponse = {
  data: [
    {
      id: "txn-1",
      orderId: "ord-1",
      orderNumber: "ORD-001",
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.SUCCEEDED,
      amount: { amount: 5000, currency: "usd" },
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const mockMethods: PaymentMethodOption[] = [
  { id: "stripe", type: PaymentMethod.STRIPE, label: "Credit Card", description: "Pay with card", enabled: true },
];

const mockConfig: PaymentConfig = {
  publishableKey: "pk_test_123",
  currency: "usd",
  allowedMethods: [PaymentMethod.STRIPE],
  minAmount: 50,
  maxAmount: 99999999,
};

const mockIntentResponse: PaymentIntentResponse = {
  clientSecret: "secret_123",
  paymentIntentId: "pi_123",
  amount: 5000,
  currency: "usd",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useCreatePaymentIntent", () => {
  it("calls createPaymentIntentApi with the request", async () => {
    const spy = vi.spyOn(api, "createPaymentIntentApi").mockResolvedValue(mockIntentResponse);

    const { result } = renderHook(() => useCreatePaymentIntent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ orderId: "ord-1" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ orderId: "ord-1" });
  });
});

describe("useConfirmPayment", () => {
  it("calls confirmPaymentApi with the request", async () => {
    const spy = vi.spyOn(api, "confirmPaymentApi").mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => useConfirmPayment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ paymentIntentId: "pi_123", orderId: "ord-1" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ paymentIntentId: "pi_123", orderId: "ord-1" });
  });
});

describe("usePaymentHistory", () => {
  it("fetches payment history", async () => {
    vi.spyOn(api, "getPaymentHistoryApi").mockResolvedValue(mockHistoryResponse);

    const { result } = renderHook(() => usePaymentHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockHistoryResponse);
  });
});

describe("usePaymentTransaction", () => {
  it("fetches transaction by id", async () => {
    vi.spyOn(api, "getPaymentTransactionApi").mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => usePaymentTransaction("txn-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockTransaction);
  });

  it("is disabled when id is undefined", async () => {
    const spy = vi.spyOn(api, "getPaymentTransactionApi");
    renderHook(() => usePaymentTransaction(undefined), { wrapper: createWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("usePaymentMethods", () => {
  it("fetches payment methods", async () => {
    vi.spyOn(api, "getPaymentMethodsApi").mockResolvedValue(mockMethods);

    const { result } = renderHook(() => usePaymentMethods(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMethods);
  });
});

describe("usePaymentConfig", () => {
  it("fetches payment config", async () => {
    vi.spyOn(api, "getPaymentConfigApi").mockResolvedValue(mockConfig);

    const { result } = renderHook(() => usePaymentConfig(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockConfig);
  });
});

describe("useAdminPaymentHistory", () => {
  it("fetches admin payment history", async () => {
    vi.spyOn(api, "getAdminPaymentHistoryApi").mockResolvedValue(mockHistoryResponse);

    const { result } = renderHook(() => useAdminPaymentHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockHistoryResponse);
  });
});

describe("useAdminPaymentTransaction", () => {
  it("fetches admin transaction by id", async () => {
    vi.spyOn(api, "getAdminPaymentTransactionApi").mockResolvedValue(mockTransaction);

    const { result } = renderHook(() => useAdminPaymentTransaction("txn-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockTransaction);
  });

  it("is disabled when id is undefined", () => {
    const spy = vi.spyOn(api, "getAdminPaymentTransactionApi");
    renderHook(() => useAdminPaymentTransaction(undefined), { wrapper: createWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useRefundPayment", () => {
  it("calls refundPaymentApi with the id", async () => {
    const spy = vi.spyOn(api, "refundPaymentApi").mockResolvedValue({
      ...mockTransaction,
      status: PaymentStatus.REFUNDED,
    });

    const { result } = renderHook(() => useRefundPayment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("txn-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("txn-1");
  });
});
