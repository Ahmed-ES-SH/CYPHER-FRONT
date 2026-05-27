"use client";

import { useState } from "react";
import { useUserOrders, useCancelOrder } from "../../orders.hooks";
import { OrderStatus } from "../../orders.types";
import type { Order } from "../../orders.types";

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserOrders({ page, limit: 10 });
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (id: string) => {
    setCancellingId(id);
    cancelOrder(id, {
      onSettled: () => setCancellingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
        <p className="text-muted-foreground">When you place an order, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <div key={order.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">{order.items.length} items</p>
              <p className="text-sm">${(order.total.amount / 100).toFixed(2)} {order.total.currency}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                order.status === OrderStatus.DELIVERED ? "bg-green-100 text-green-800" :
                order.status === OrderStatus.CANCELLED ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex gap-2">
              {order.status === OrderStatus.PENDING && (
                <button
                  onClick={() => handleCancel(order.id)}
                  disabled={isCancelling && cancellingId === order.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {isCancelling && cancellingId === order.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
              <a
                href={`/orders/${order.id}`}
                className="text-sm text-primary hover:underline"
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
