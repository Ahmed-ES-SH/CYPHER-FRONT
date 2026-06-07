"use client";

import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Product } from "@/src/modules/products";

interface ProductTableProps {
  products: Product[];
  onEdit?: (p: Product) => void;
  onDelete?: (p: Product) => void;
  onTogglePublish?: (p: Product) => void;
  busyIds?: string[];
}

export default function ProductTable({ products, onEdit, onDelete, onTogglePublish, busyIds = [] }: ProductTableProps) {
  const formatPrice = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-elevated">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-container-high text-left text-xs font-semibold text-text-secondary uppercase">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-text-primary divide-y divide-border-subtle">
          {products.map((p) => {
            const busy = busyIds.includes(p.id);
            const img = p.thumbnail || p.media?.[0]?.url;
            return (
              <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-surface-container-high flex items-center justify-center">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm text-text-muted">No image</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text-primary truncate">{p.title}</div>
                      <div className="text-xs text-text-secondary truncate">{p.category?.name ?? "Uncategorized"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 align-top">{p.stock}</td>
                <td className="px-4 py-3 align-top">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.isPublished ? "Published" : "Draft"}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onTogglePublish?.(p)}
                      disabled={busy}
                      className="rounded-lg px-3 py-2 text-sm border border-border-subtle hover:bg-surface-container-low disabled:opacity-50"
                    >
                      {p.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    {onEdit && (
                      <button onClick={() => onEdit(p)} className="rounded-lg p-2 text-text-muted hover:bg-surface-container-low">
                        <FiEdit2 className="size-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(p)} className="rounded-lg p-2 text-text-muted hover:bg-rose-50 hover:text-rose-600">
                        <FiTrash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
