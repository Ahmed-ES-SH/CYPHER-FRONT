"use client";

import React from "react";
import type { Category } from "@/src/modules/categories";

interface Props {
  categories: Category[];
  busyIds: string[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

export default function CategoryListTable({ categories, busyIds, onEdit, onDelete }: Props) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden">
      <table className="w-full table-fixed">
        <thead className="bg-surface-container p-2 text-left text-sm text-text-secondary">
          <tr>
            <th className="p-3 w-24">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Order</th>
            <th className="p-3">Created</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-border-subtle">
              <td className="p-3">
                {c.icon ? <img src={c.icon} alt={c.name} className="h-12 w-12 object-cover rounded-md" /> : <div className="h-12 w-12 bg-surface-container flex items-center justify-center text-text-muted rounded-md">—</div>}
              </td>
              <td className="p-3">
                <div className="font-medium text-text-primary">{c.name}</div>
              </td>
              <td className="p-3 text-text-secondary">{c.slug}</td>
              <td className="p-3">{c.order ?? 0}</td>
              <td className="p-3 text-text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="p-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <button disabled={busyIds.includes(c.id)} onClick={() => onEdit(c)} className="rounded-md border px-3 py-1 text-sm">Edit</button>
                  <button disabled={busyIds.includes(c.id)} onClick={() => onDelete(c)} className="rounded-md border px-3 py-1 text-sm text-rose-600">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
