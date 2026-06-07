"use client";

import { useState } from "react";
import { useUserOrders, useCancelOrder } from "../../hooks/useOrders.hook";
import { OrderStatus } from "../../contracts/order-status";
import { formatMoney } from "../../utils/money";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "../../contracts/order.types";

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useUserOrders({ page, limit: 10 });
  const { mutate: cancelOrder } = useCancelOrder();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (id: string, orderNumber: string) => {
    setCancellingId(id);
    cancelOrder(id, {
      onSuccess: () => {
        toast.success(`Order ${orderNumber} has been successfully cancelled.`);
      },
      onError: (err) => {
        toast.error(`Failed to cancel order: ${err.message}`);
      },
      onSettled: () => setCancellingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <div className="h-10 w-48 bg-zinc-800 animate-pulse rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 w-full border border-zinc-800 bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="p-6 border border-red-950 bg-red-950/20 rounded-2xl max-w-md mx-auto">
          <p className="text-red-400 font-medium">Failed to retrieve orders</p>
          <p className="text-sm text-red-500/80 mt-1">{error?.message}</p>
        </div>
      </div>
    );
  }

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">No orders found</h2>
        <p className="text-zinc-400 max-w-sm mx-auto">When you make purchases, your order history will be detailed here.</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case OrderStatus.CANCELLED:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case OrderStatus.PENDING:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Purchase History</h1>
          <p className="text-zinc-400 text-sm mt-1">Review, track, and manage your placed orders.</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order: Order, index: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/20 hover:shadow-2xl hover:shadow-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm font-semibold text-zinc-300 group-hover:text-primary transition-colors">
                    {order.orderNumber}
                  </p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} {order.items.length === 1 ? "item" : "items"}
                  </span>
                  <span className="font-bold text-zinc-200">
                    {formatMoney(order.total)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                {order.status === OrderStatus.PENDING && (
                  <button
                    onClick={() => handleCancel(order.id, order.orderNumber)}
                    disabled={cancellingId === order.id}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-95 disabled:opacity-50 transition-all duration-200"
                  >
                    {cancellingId === order.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        Cancelling...
                      </span>
                    ) : "Cancel Order"}
                  </button>
                )}

                <a
                  href={`/orders/${order.id}`}
                  className="flex-1 sm:flex-initial text-center px-4 py-2 text-xs font-semibold rounded-lg text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-200"
                >
                  View Details
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
          >
            &larr; Previous
          </button>

          <span className="text-xs font-medium text-zinc-400">
            Page <span className="text-zinc-200 font-bold">{page}</span> of <span className="text-zinc-200 font-bold">{data.meta.totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
