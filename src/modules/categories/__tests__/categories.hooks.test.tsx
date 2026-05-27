import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCategories,
  useCategory,
  useAdminCategories,
  useAdminCategory,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} from "../categories.hooks";
import * as api from "../categories.api";

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

const mockCategory = {
  id: "cat-1",
  name: "Test",
  slug: "test",
  description: null,
  color: null,
  icon: null,
  order: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockCategoryDetails = {
  ...mockCategory,
  parentId: null,
  children: [],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

/* =========================================================
   useCategories
   ========================================================= */

describe("useCategories", () => {
  it("fetches public category list", async () => {
    vi.spyOn(api, "getCategoriesApi").mockResolvedValue([mockCategory]);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockCategory]);
  });

  it("returns empty array when API returns empty", async () => {
    vi.spyOn(api, "getCategoriesApi").mockResolvedValue([]);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

/* =========================================================
   useCategory
   ========================================================= */

describe("useCategory", () => {
  it("fetches category by slug", async () => {
    vi.spyOn(api, "getCategoryApi").mockResolvedValue(mockCategoryDetails);

    const { result } = renderHook(() => useCategory("test"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategoryDetails);
  });

  it("is disabled when slug is undefined", async () => {
    const spy = vi.spyOn(api, "getCategoryApi");

    const { result } = renderHook(() => useCategory(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("is disabled when slug is empty string", async () => {
    const spy = vi.spyOn(api, "getCategoryApi");

    const { result } = renderHook(() => useCategory(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

/* =========================================================
   useAdminCategories
   ========================================================= */

describe("useAdminCategories", () => {
  it("fetches paginated admin list", async () => {
    vi.spyOn(api, "getAdminCategoriesApi").mockResolvedValue({
      data: [mockCategory],
      meta: { page: 1, limit: 20, lastPage: 1, total: 1 },
    });

    const { result } = renderHook(() => useAdminCategories({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([mockCategory]);
    expect(result.current.data?.meta.total).toBe(1);
  });

  it("accepts filter params", async () => {
    const spy = vi
      .spyOn(api, "getAdminCategoriesApi")
      .mockResolvedValue({ data: [], meta: { page: 1, limit: 20, lastPage: 0, total: 0 } });

    renderHook(
      () =>
        useAdminCategories({
          page: 2,
          limit: 10,
          search: "test",
          sortBy: "name",
          sortOrder: "ASC",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});

/* =========================================================
   useAdminCategory
   ========================================================= */

describe("useAdminCategory", () => {
  it("fetches admin category by id", async () => {
    vi.spyOn(api, "getAdminCategoryApi").mockResolvedValue(
      mockCategoryDetails,
    );

    const { result } = renderHook(() => useAdminCategory("cat-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategoryDetails);
  });

  it("is disabled when id is undefined", async () => {
    const spy = vi.spyOn(api, "getAdminCategoryApi");

    const { result } = renderHook(() => useAdminCategory(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

/* =========================================================
   useCreateCategoryMutation
   ========================================================= */

describe("useCreateCategoryMutation", () => {
  it("calls createCategoryApi with input", async () => {
    const spy = vi
      .spyOn(api, "createCategoryApi")
      .mockResolvedValue(mockCategory);

    const { result } = renderHook(() => useCreateCategoryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: "New Category" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ name: "New Category" });
  });
});

/* =========================================================
   useUpdateCategoryMutation
   ========================================================= */

describe("useUpdateCategoryMutation", () => {
  it("calls updateCategoryApi with id and input", async () => {
    const spy = vi
      .spyOn(api, "updateCategoryApi")
      .mockResolvedValue(mockCategory);

    const { result } = renderHook(() => useUpdateCategoryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "cat-1", input: { name: "Updated" } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("cat-1", { name: "Updated" });
  });
});

/* =========================================================
   useDeleteCategoryMutation
   ========================================================= */

describe("useDeleteCategoryMutation", () => {
  it("calls deleteCategoryApi with id", async () => {
    const spy = vi
      .spyOn(api, "deleteCategoryApi")
      .mockResolvedValue({ success: true, message: "Deleted" });

    const { result } = renderHook(() => useDeleteCategoryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("cat-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("cat-1");
  });
});

/* =========================================================
   useReorderCategoriesMutation
   ========================================================= */

describe("useReorderCategoriesMutation", () => {
  it("calls reorderCategoriesApi with input", async () => {
    const spy = vi
      .spyOn(api, "reorderCategoriesApi")
      .mockResolvedValue([mockCategory]);

    const { result } = renderHook(() => useReorderCategoriesMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ items: [{ id: "cat-1", order: 1 }] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({
      items: [{ id: "cat-1", order: 1 }],
    });
  });
});
