"use client";

import React from "react";

interface Props {
  posts: any[];
  onEdit: (p: any) => void;
  onDelete: (p: any) => void;
  busyIds?: string[];
}

export default function BlogList({ posts, onEdit, onDelete, busyIds = [] }: Props) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-text-secondary">
            <th className="py-2">Title</th>
            <th className="py-2">Category</th>
            <th className="py-2">Status</th>
            <th className="py-2">Created</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-text-secondary">No posts found</td>
            </tr>
          )}
          {posts.map((p) => (
            <tr key={p.id} className="border-t border-border-subtle">
              <td className="py-3">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-text-secondary">{p.excerpt}</div>
              </td>
              <td className="py-3">{p.category?.name ?? "-"}</td>
              <td className="py-3">{p.status}</td>
              <td className="py-3 text-sm text-text-secondary">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(p)} className="rounded-lg px-3 py-1 text-sm bg-surface-container-high">Edit</button>
                  <button onClick={() => onDelete(p)} disabled={busyIds.includes(p.id)} className="rounded-lg px-3 py-1 text-sm bg-rose-600 text-white disabled:opacity-50">{busyIds.includes(p.id) ? 'Deleting...' : 'Delete'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
