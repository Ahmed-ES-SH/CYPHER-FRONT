"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAdminCategories,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/src/modules/categories";
import { useCategoryFilters } from "@/src/modules/categories/hooks/useCategoryFilters.hook";
import CategoryFilters from "./CategoryFilters";
import CategoryListTable from "./CategoryListTable";
import EditCategoryModal from "./EditCategoryModal";

export default function CategoryListWrapper() {
  const { page, limit, search, sortBy, sortOrder, updateFilter } = useCategoryFilters();

  const filters = useMemo(() => ({ page, limit, search, sortBy, sortOrder }), [page, limit, search, sortBy, sortOrder]);

  const { data, isLoading, error } = useAdminCategories(filters as any);
  const categories = data?.data ?? [];
  const meta = data?.meta;

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const busyIds = pendingIds;

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setShowModal(true);
  };

  const handleDelete = async (c: any) => {
    if (!window.confirm(`Delete category ${c.name}?`)) return;
    setPendingIds((s) => (s.includes(c.id) ? s : [...s, c.id]));
    try {
      await deleteMutation.mutateAsync(c.id);
      toast.success("Category deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete category");
    } finally {
      setPendingIds((s) => s.filter((id) => id !== c.id));
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage store categories and hierarchy.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="rounded-lg bg-primary-blue text-white px-4 py-2 text-sm">Add Category</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-sm text-text-secondary">Total Categories</p>
          <p className="text-2xl font-bold text-text-primary">{meta?.total ?? categories.length}</p>
        </div>
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-sm text-text-secondary">On Page</p>
          <p className="text-2xl font-bold text-text-primary">{categories.length}</p>
        </div>
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-sm text-text-secondary">Page</p>
          <p className="text-2xl font-bold text-text-primary">{meta?.page ?? page}</p>
        </div>
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-sm text-text-secondary">Last Updated</p>
          <p className="text-2xl font-bold text-text-primary">{categories[0] ? new Date(categories[0].updatedAt).toLocaleDateString() : "—"}</p>
        </div>
      </div>

      <div className="bg-transparent">
        <div className="mb-4">
          <CategoryFilters search={search} sortBy={sortBy} sortOrder={sortOrder} limit={limit} updateFilter={updateFilter} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-md">Failed to load categories</div>
        ) : (
          <>
            <CategoryListTable categories={categories} busyIds={busyIds} onEdit={openEdit} onDelete={handleDelete} />

            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={(meta?.page ?? page) <= 1} onClick={() => updateFilter("page", (meta?.page ?? page) - 1)} className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50">Previous</button>
              <span className="text-sm text-text-secondary">Page {meta?.page ?? page} of {meta?.lastPage ?? 1}</span>
              <button disabled={(meta?.page ?? page) >= (meta?.lastPage ?? 1)} onClick={() => updateFilter("page", (meta?.page ?? page) + 1)} className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <EditCategoryModal
          category={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
