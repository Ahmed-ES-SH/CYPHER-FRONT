export interface CreateCheckoutSessionInput {
  orderId?: string;
  items?: Array<{ productId: string; quantity: number }>;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  expiresAt?: string;
  status?: string;
}

export interface CheckoutState {
  sessionId: string | null;
  status: "idle" | "creating" | "redirecting" | "completed" | "failed";
  error: CheckoutError | null;
}

export interface CheckoutError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface PostCheckoutCleanup {
  clearCart?: () => Promise<void>;
  invalidateQueries?: () => Promise<void>;
}
