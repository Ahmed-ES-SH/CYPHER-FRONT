import type { OrderStatus, PaymentStatus } from "../contracts/order-status";
import {
  ORDER_STATUS,
  TERMINAL_STATUSES,
  PENDING_PAYMENT_STATUSES,
  COMPLETED_PAYMENT_STATUSES,
  VALID_STATUS_TRANSITIONS,
} from "../contracts/order-status";

export function isTerminalStatus(status: OrderStatus): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function isPendingPayment(status: PaymentStatus): boolean {
  return (PENDING_PAYMENT_STATUSES as readonly string[]).includes(status);
}

export function isPaymentComplete(status: PaymentStatus): boolean {
  return (COMPLETED_PAYMENT_STATUSES as readonly string[]).includes(status);
}

export function shouldPoll(status?: OrderStatus, paymentStatus?: PaymentStatus): boolean {
  if (!status) return false;
  if (isTerminalStatus(status)) return false;
  if (paymentStatus === "failed") return false;
  return true;
}

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
