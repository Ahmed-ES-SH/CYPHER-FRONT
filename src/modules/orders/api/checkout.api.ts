/* eslint-disable @typescript-eslint/no-explicit-any */
import { CHECKOUT_ENDPOINTS } from "./orders.endpoints";
import { getOrderTransport } from "./orders.transport";
import type { CreateCheckoutSessionInput, CheckoutSessionResponse } from "../contracts/checkout.types";

export async function createCheckoutSessionApi(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResponse> {
  const transport = getOrderTransport();
  const raw = await transport.post<any>(CHECKOUT_ENDPOINTS.CREATE_SESSION, input);
  return {
    sessionId: raw.sessionId ?? raw.session_id ?? raw.id ?? raw.sessionId,
    url: raw.url,
    expiresAt: raw.expiresAt ?? raw.expires_at ?? undefined,
    status: raw.status ?? undefined,
  };
}

export async function getCheckoutSessionStatusApi(
  sessionId: string,
): Promise<{ status: string; orderId?: string }> {
  const transport = getOrderTransport();
  const raw = await transport.get(CHECKOUT_ENDPOINTS.SESSION_STATUS(sessionId));
  return {
    status: raw.status ?? "unknown",
    orderId: raw.orderId ?? raw.order_id ?? undefined,
  };
}
