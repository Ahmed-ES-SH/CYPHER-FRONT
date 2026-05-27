"use client";

import { useParams } from "next/navigation";
import { useOrderDetail } from "../../orders.hooks";
import { OrderStatus } from "../../orders.types";

export function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: order, isLoading } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground">This order may have been removed or the link is invalid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a href="/orders" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Back to orders</a>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === OrderStatus.DELIVERED ? "bg-green-100 text-green-800" :
          order.status === OrderStatus.CANCELLED ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${(item.subtotal.amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(order.subtotal.amount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${(order.shippingCost.amount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${(order.tax.amount / 100).toFixed(2)}</span>
            </div>
            {order.discountAmount && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${(order.discountAmount.amount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>${(order.total.amount / 100).toFixed(2)} {order.total.currency}</span>
            </div>
          </div>

          <h2 className="font-semibold mt-6 mb-3">Shipping Address</h2>
          <div className="border rounded-lg p-4 text-sm">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
          </div>

          {order.notes && (
            <>
              <h2 className="font-semibold mt-6 mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
