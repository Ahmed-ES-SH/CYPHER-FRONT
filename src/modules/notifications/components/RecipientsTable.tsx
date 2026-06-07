"use client";

import React, { useState, useMemo } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useUsers } from "@/src/modules/user";

interface RecipientsTableProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function RecipientsTable({ selected, onChange }: RecipientsTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useUsers({ q: search, page: String(page), limit: String(perPage) } as any);

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.lastPage ?? 1;

  const currentPageIds = useMemo(() => users.map((u: any) => String(u.id)), [users]);

  const allOnPageSelected = currentPageIds.every((id) => selected.includes(id)) && currentPageIds.length > 0;

  function toggleSelectOne(id: string) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  function toggleSelectAllOnPage() {
    if (allOnPageSelected) {
      // deselect all on this page
      onChange(selected.filter((s) => !currentPageIds.includes(s)));
    } else {
      // add missing ids
      const add = currentPageIds.filter((id) => !selected.includes(id));
      onChange([...selected, ...add]);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 w-full max-w-md">
          <HiOutlineMagnifyingGlass className="size-5 text-text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter users by name or email..."
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm"
          />
        </div>
        <div className="text-sm text-text-muted">Showing {users.length} of {total} users</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAllOnPage} />
              </th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center">No users found</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(String(u.id))}
                      onChange={() => toggleSelectOne(String(u.id))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{(u.name || u.email || "").split(" ").map((s: string)=>s[0]).join("")}</div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.name ?? "—"}</div>
                        <div className="text-xs text-text-muted truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-text-muted">Selected: {selected.length}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-border-subtle text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">{page} / {lastPage}</span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="px-3 py-1 rounded border border-border-subtle text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
