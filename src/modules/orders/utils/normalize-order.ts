/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Order, OrderItem, ShippingAddress, Money } from "../contracts/order.types";

export function toMoney(raw: any, defaultCurrency = "usd"): Money {
  return {
    amount: raw?.amount ?? raw ?? 0,
    currency: raw?.currency ?? defaultCurrency,
  };
}

export function toOrderItem(raw: any): OrderItem {
  return {
    id: raw.id,
    productId: raw.productId ?? raw.product_id ?? "",
    productName: raw.productName ?? raw.product_name ?? "",
    productSlug: raw.productSlug ?? raw.product_slug ?? "",
    productImage: raw.productImage ?? raw.product_image ?? "",
    unitPrice: toMoney(raw.unitPrice ?? raw.unit_price, raw.currency),
    quantity: raw.quantity ?? 1,
    subtotal: toMoney(raw.subtotal ?? raw.subtotal, raw.currency),
  };
}

export function toShippingAddress(raw: any): ShippingAddress {
  return {
    fullName: raw.fullName ?? raw.full_name ?? "",
    addressLine1: raw.addressLine1 ?? raw.address_line1 ?? "",
    addressLine2: raw.addressLine2 ?? raw.address_line2 ?? undefined,
    city: raw.city ?? "",
    state: raw.state ?? undefined,
    postalCode: raw.postalCode ?? raw.postal_code ?? "",
    country: raw.country ?? "",
    phone: raw.phone ?? undefined,
  };
}

export function toOrder(raw: any): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber ?? raw.order_number ?? raw.id,
    userId: raw.userId ?? raw.user_id ?? "",
    items: (raw.items ?? []).map(toOrderItem),
    subtotal: toMoney(raw.subtotal ?? raw.subtotal),
    shippingCost: toMoney(raw.shippingCost ?? raw.shipping_cost ?? raw.shippingCost),
    tax: toMoney(raw.tax ?? raw.tax),
    total: toMoney(raw.total ?? raw.total),
    currency: raw.currency ?? "usd",
    status: raw.status ?? "pending",
    paymentStatus: raw.paymentStatus ?? raw.payment_status ?? "pending",
    shippingAddress: toShippingAddress(raw.shippingAddress ?? raw.shipping_address ?? {}),
    notes: raw.notes ?? undefined,
    couponCode: raw.couponCode ?? raw.coupon_code ?? undefined,
    discountAmount: raw.discountAmount ?? raw.discount_amount
      ? toMoney(raw.discountAmount ?? raw.discount_amount)
      : undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}
