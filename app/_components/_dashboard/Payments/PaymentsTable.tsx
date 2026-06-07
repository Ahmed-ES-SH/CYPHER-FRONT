"use client";

import React from "react";
import { FiChevronRight, FiRefreshCw } from "react-icons/fi";
import type { PaymentHistoryItem } from "@/src/modules/payments";

interface Props {
  transactions: PaymentHistoryItem[];
  onSelect?: (id: string) => void;
  loading?: boolean;
}

export default function PaymentsTable({ transactions, onSelect, loading }: Props) {
  const fmt = (v: number, cur = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(v);

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-elevated">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-container-high text-left text-xs font-semibold text-text-secondary uppercase">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-text-primary divide-y divide-border-subtle">
          {loading && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-text-secondary">Loading...</td>
            </tr>
          )}

          {!loading && transactions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-text-secondary">No transactions</td>
            </tr>
          )}

          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
              <td className="px-4 py-3 align-top">{t.id}</td>
              <td className="px-4 py-3 align-top">{t.orderNumber || t.orderId || "-"}</td>
              <td className="px-4 py-3 align-top">{t.method}</td>
              <td className="px-4 py-3 align-top">
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "succeeded" ? "bg-green-100 text-green-700" : t.status === "refunded" ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-600"}`}>
                  {t.status}
                </div>
              </td>
              <td className="px-4 py-3 align-top font-semibold">{fmt(t.amount.amount, t.amount.currency.toUpperCase())}</td>
              <td className="px-4 py-3 align-top">{new Date(t.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onSelect?.(t.id)} className="rounded-lg p-2 text-text-muted hover:bg-surface-container-low">
                    <FiChevronRight />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
