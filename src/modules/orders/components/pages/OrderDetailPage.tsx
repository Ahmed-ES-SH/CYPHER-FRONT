"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useOrderDetail } from "../../hooks/useOrders.hook";
import { OrderStatus } from "../../contracts/order-status";
import { formatMoney } from "../../utils/money";

export function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: order, isLoading, isError, error } = useOrderDetail(id, true);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded-lg" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-zinc-800 animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-zinc-800 animate-pulse rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 w-full border border-zinc-800 bg-zinc-900/50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 w-full border border-zinc-800 bg-zinc-900/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="p-6 border border-red-950 bg-red-950/20 rounded-2xl max-w-md mx-auto">
          <p className="text-red-400 font-medium">Failed to load order</p>
          <p className="text-sm text-red-500/80 mt-1">{error?.message}</p>
          <a href="/orders" className="inline-block mt-4 px-4 py-2 text-xs font-semibold rounded-lg text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all">
            Back to orders
          </a>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 mb-6">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Order not found</h2>
        <p className="text-zinc-400 max-w-sm mx-auto mb-6">This order may have been removed or the link is invalid.</p>
        <a href="/orders" className="inline-block px-4 py-2 text-xs font-semibold rounded-lg text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all">
          Back to orders
        </a>
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
      <a href="/orders" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-8">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to orders
      </a>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Order {order.orderNumber}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border font-medium self-start sm:self-center ${getStatusStyle(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-xl p-4 transition-all duration-200 hover:border-zinc-700/80">
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-200 truncate">{item.productName}</p>
                  <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-zinc-200 whitespace-nowrap">{formatMoney(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-200">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Shipping</span>
                <span className="text-zinc-200">{formatMoney(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tax</span>
                <span className="text-zinc-200">{formatMoney(order.tax)}</span>
              </div>
              {order.discountAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Discount</span>
                  <span className="text-emerald-400">-{formatMoney(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white border-t border-zinc-800 pt-3">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Shipping Address</h2>
            <div className="text-sm text-zinc-300 space-y-1">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p className="pt-1 text-zinc-500">{order.shippingAddress.phone}</p>}
            </div>
          </div>

          {order.notes && (
            <div className="border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
              <p className="text-sm text-zinc-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
