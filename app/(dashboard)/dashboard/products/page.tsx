"use client";

import React, { useState } from "react";
import { useAdminProducts, useToggleProductPublish, useDeleteProduct } from "@/src/modules/products";
import ProductTable from "@/app/_components/_dashboard/Products/ProductTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const filters = { page } as any;

  const { data, isLoading } = useAdminProducts(filters);
  const products = data?.data ?? [];
  const toggleMutation = useToggleProductPublish();
  const deleteMutation = useDeleteProduct();

  const router = useRouter();

  // Track pending operations per-product so we can disable only affected rows
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const busyIds = pendingIds;

  const handleToggle = async (p: any) => {
    setPendingIds((s) => (s.includes(p.id) ? s : [...s, p.id]));
    try {
      await toggleMutation.mutateAsync(p.id);
      toast.success("Product publish toggled");
    } catch (e: any) {
      toast.error(e?.message || "Failed to toggle publish");
    } finally {
      setPendingIds((s) => s.filter((id) => id !== p.id));
    }
  };

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Delete product ${p.title}?`)) return;
    setPendingIds((s) => (s.includes(p.id) ? s : [...s, p.id]));
    try {
      await deleteMutation.mutateAsync(p.id);
      toast.success("Product deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete product");
    } finally {
      setPendingIds((s) => s.filter((id) => id !== p.id));
    }
  };

  return (
    <div className="mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your product catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/products/new" className="rounded-lg bg-primary-blue text-white px-4 py-2 text-sm">Create Product</Link>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Total Products</p>
              <p className="text-2xl font-bold text-text-primary">5,200</p>
            </div>
            <div className="p-2 rounded-lg bg-primary-cyan/10 text-primary-cyan">▲</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Updated today</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Published</p>
              <p className="text-2xl font-bold text-text-primary">3,800</p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 text-green-700">✔</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Visible in store</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Out of Stock</p>
              <p className="text-2xl font-bold text-text-primary">64</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">!</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Needs restock</div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-secondary">Low Stock (&lt;10)</p>
              <p className="text-2xl font-bold text-text-primary">132</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">⚠</div>
          </div>
          <div className="text-sm text-text-muted mt-3">Monitor closely</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Sales Trend (Static)</h3>
            <div className="text-sm text-text-muted">Last 12 months</div>
          </div>
          <div className="w-full h-48 relative flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="prodGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0070dc" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0070dc" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,140 C80,120 160,90 240,110 C320,130 400,70 480,90 C560,100 640,60 720,40 C800,30 880,20 880,20 L880,200 L0,200 Z" fill="url(#prodGradient)" />
              <path d="M0,140 C80,120 160,90 240,110 C320,130 400,70 480,90 C560,100 640,60 720,40 C800,30" fill="none" stroke="#0070dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Stock By Category</h3>
          <div className="flex flex-col gap-3">
            {[
              { name: "Electronics", pct: 42 },
              { name: "Accessories", pct: 25 },
              { name: "Home", pct: 18 },
              { name: "Wearables", pct: 15 },
            ].map((c) => (
              <div key={c.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-text-primary">{c.name}</span>
                  <span className="text-sm text-text-secondary">{c.pct}%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(p) => window.location.assign(`/dashboard/products/${p.id}/edit`)}
          onDelete={handleDelete}
          onTogglePublish={handleToggle}
          busyIds={busyIds}
        />
      )}

      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((v) => Math.max(1, v - 1))}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-text-secondary">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((v) => v + 1)}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
