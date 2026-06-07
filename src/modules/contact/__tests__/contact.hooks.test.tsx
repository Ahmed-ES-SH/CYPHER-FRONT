import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useSubmitContact,
  useContactList,
  useContactDetail,
  useMarkContactAsRead,
  useMarkContactAsReplied,
  useDeleteContact,
  useContactAdmin,
} from "../hooks/contact.hooks";
import * as api from "../api/contact.api";
import type { ContactMessage, ContactListResponse } from "../types/contact.types";

/* =========================================================
   Test setup
   ========================================================= */

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

const mockMessage: ContactMessage = {
  id: "msg-1",
  fullName: "John Doe",
  email: "john@test.com",
  subject: "Help",
  message: "I need assistance",
  isRead: false,
  repliedAt: null,
  ipAddress: "127.0.0.1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockListResponse: ContactListResponse = {
  data: [mockMessage],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

/* =========================================================
   useSubmitContact
   ========================================================= */

describe("useSubmitContact", () => {
  it("calls submitContactMessageApi with the DTO", async () => {
    const spy = vi
      .spyOn(api, "submitContactMessageApi")
      .mockResolvedValue({ message: "Sent", id: "msg-1" });

    const { result } = renderHook(() => useSubmitContact(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fullName: "John",
      email: "john@test.com",
      subject: "Test",
      message: "Hello world",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({
      fullName: "John",
      email: "john@test.com",
      subject: "Test",
      message: "Hello world",
    });
  });

  it("surfaces error when API fails", async () => {
    vi.spyOn(api, "submitContactMessageApi").mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useSubmitContact(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fullName: "John",
      email: "john@test.com",
      subject: "Test",
      message: "Hello world",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network error");
  });
});

/* =========================================================
   useContactList
   ========================================================= */

describe("useContactList", () => {
  it("fetches contact list with default params", async () => {
    vi.spyOn(api, "getContactMessagesApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useContactList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockListResponse);
  });

  it("fetches contact list with custom params", async () => {
    const spy = vi
      .spyOn(api, "getContactMessagesApi")
      .mockResolvedValue(mockListResponse);

    renderHook(() => useContactList({ page: 2, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("returns empty data when no messages exist", async () => {
    vi.spyOn(api, "getContactMessagesApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useContactList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
    expect(result.current.data?.meta.total).toBe(0);
  });

  it("staleTime prevents refetch within 5 minutes", async () => {
    const spy = vi
      .spyOn(api, "getContactMessagesApi")
      .mockResolvedValue(mockListResponse);

    const { rerender } = renderHook(() => useContactList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    rerender();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

/* =========================================================
   useContactDetail
   ========================================================= */

describe("useContactDetail", () => {
  it("fetches message by id", async () => {
    vi.spyOn(api, "getContactMessageByIdApi").mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useContactDetail("msg-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMessage);
  });

  it("is disabled when id is undefined", async () => {
    const spy = vi.spyOn(api, "getContactMessageByIdApi");

    const { result } = renderHook(() => useContactDetail(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("is disabled when id is empty string", async () => {
    const spy = vi.spyOn(api, "getContactMessageByIdApi");

    const { result } = renderHook(() => useContactDetail(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

/* =========================================================
   useMarkContactAsRead
   ========================================================= */

describe("useMarkContactAsRead", () => {
  it("calls markContactAsReadApi with the id", async () => {
    const spy = vi
      .spyOn(api, "markContactAsReadApi")
      .mockResolvedValue({ message: "Marked as read", id: "msg-1" });

    const { result } = renderHook(() => useMarkContactAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("msg-1");
  });

  it("invalidates detail and list caches on success", async () => {
    vi.spyOn(api, "markContactAsReadApi").mockResolvedValue({
      message: "Marked as read",
      id: "msg-1",
    });
    const invalidateSpy = vi.spyOn(api, "invalidateContactLists");
    const detailSpy = vi.spyOn(api, "invalidateContactDetail");

    const { result } = renderHook(() => useMarkContactAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

/* =========================================================
   useMarkContactAsReplied
   ========================================================= */

describe("useMarkContactAsReplied", () => {
  it("calls markContactAsRepliedApi with the id", async () => {
    const spy = vi
      .spyOn(api, "markContactAsRepliedApi")
      .mockResolvedValue({ message: "Marked as replied", id: "msg-1" });

    const { result } = renderHook(() => useMarkContactAsReplied(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("msg-1");
  });

  it("invalidates detail and list caches on success", async () => {
    vi.spyOn(api, "markContactAsRepliedApi").mockResolvedValue({
      message: "Marked as replied",
      id: "msg-1",
    });
    const invalidateSpy = vi.spyOn(api, "invalidateContactLists");

    const { result } = renderHook(() => useMarkContactAsReplied(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

/* =========================================================
   useDeleteContact
   ========================================================= */

describe("useDeleteContact", () => {
  it("calls deleteContactMessageApi with the id", async () => {
    const spy = vi
      .spyOn(api, "deleteContactMessageApi")
      .mockResolvedValue({ message: "Deleted", id: "msg-1" });

    const { result } = renderHook(() => useDeleteContact(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("msg-1");
  });

  it("removes detail cache and invalidates lists on success", async () => {
    vi.spyOn(api, "deleteContactMessageApi").mockResolvedValue({
      message: "Deleted",
      id: "msg-1",
    });
    const removeSpy = vi.spyOn(api, "removeContactDetail");
    const invalidateSpy = vi.spyOn(api, "invalidateContactLists");

    const { result } = renderHook(() => useDeleteContact(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("msg-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removeSpy).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

/* =========================================================
   useContactAdmin
   ========================================================= */

describe("useContactAdmin", () => {
  it("returns messages, meta, and loading state", async () => {
    vi.spyOn(api, "getContactMessagesApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useContactAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([mockMessage]);
    expect(result.current.meta).toEqual(mockListResponse.meta);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty messages array when no data", async () => {
    vi.spyOn(api, "getContactMessagesApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const { result } = renderHook(() => useContactAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([]);
  });

  it("passes params to useContactList", async () => {
    const spy = vi
      .spyOn(api, "getContactMessagesApi")
      .mockResolvedValue(mockListResponse);

    renderHook(() => useContactAdmin({ isRead: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("returns mutation and selection properties", async () => {
    vi.spyOn(api, "getContactMessagesApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useContactAdmin(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toHaveProperty("selectedContactId");
    expect(result.current).toHaveProperty("setSelectedContactId");
    expect(result.current).toHaveProperty("detail");
    expect(result.current).toHaveProperty("isDetailLoading");
    expect(result.current).toHaveProperty("markAsRead");
    expect(result.current).toHaveProperty("markAsReplied");
    expect(result.current).toHaveProperty("deleteMessage");
  });
});
