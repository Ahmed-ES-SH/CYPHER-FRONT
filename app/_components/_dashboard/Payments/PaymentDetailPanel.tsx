"use client";

import React from "react";
import { FiX, FiRepeat } from "react-icons/fi";
import { useAdminPaymentTransaction, useRefundPayment } from "@/src/modules/payments";

interface Props {
  id?: string;
  onClose?: () => void;
}

export default function PaymentDetailPanel({ id, onClose }: Props) {
  const { data, isLoading } = useAdminPaymentTransaction(id);
  const refund = useRefundPayment();

  if (!id) return null;

  const handleRefund = async () => {
    if (!id) return;
    const ok = window.confirm("Are you sure you want to refund this payment?");
    if (!ok) return;
    try {
      await refund.mutateAsync(id);
      // After refund, the hook invalidation will refetch
      alert("Refund requested");
    } catch (err: any) {
      alert(err?.message || "Refund failed");
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[520px] bg-surface p-6 shadow-xl z-50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment #{id}</h3>
          <p className="text-sm text-text-secondary">Details</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-surface-container-low"><FiX /></button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <div className="text-text-secondary">Loading...</div>}

        {!isLoading && data && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-text-secondary">Status</div>
                <div className="font-medium">{data.status}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Method</div>
                <div className="font-medium">{data.method}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Amount</div>
                <div className="font-medium">{data.amount.amount} {data.amount.currency}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Created</div>
                <div className="font-medium">{new Date(data.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Order</div>
              <div className="font-medium">{data.orderNumber || data.orderId || "-"}</div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Description</div>
              <div className="font-medium">{data.description || "-"}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button onClick={handleRefund} disabled={refund.isLoading} className="rounded-lg bg-rose-600 text-white px-4 py-2 text-sm disabled:opacity-50">{refund.isLoading ? 'Processing...' : 'Refund'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
