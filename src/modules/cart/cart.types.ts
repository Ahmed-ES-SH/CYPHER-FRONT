/* =========================================================
   Domain Types
   ========================================================= */

export interface Money {
  amount: number;
  currency: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: Money;
  quantity: number;
  subtotal: Money;
  stock: number;
  minimumQuantity: number;
  maximumQuantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: Money;
  total: Money;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: Money;
  total: Money;
  currency: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface GuestCartItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: Money;
  quantity: number;
  stock: number;
  minimumQuantity: number;
  maximumQuantity: number;
}

/* =========================================================
   DTO Types (backend contract)
   ========================================================= */

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  subtotal: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  quantity: number;
  stock: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
}

export interface AddItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateItemDto {
  quantity: number;
}

export interface ClearCartResponseDto {
  success: boolean;
  message: string;
}

export interface CheckoutRequestDto {
  shippingMethod?: string;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  lineItems?: CheckoutLineItemDto[];
}

export interface CheckoutLineItemDto {
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutResponseDto {
  sessionId: string;
  url: string;
}

export interface SyncCartDto {
  items: { productId: string; quantity: number }[];
}

/* =========================================================
   Error Types
   ========================================================= */

export interface CartApiError {
  message: string;
  status: number;
  path?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}

export type CartValidationErrorMap = Record<string, string>;

/* =========================================================
   Service Types
   ========================================================= */

export interface SyncResult {
  success: boolean;
  cart?: Cart;
  errors?: Array<{ productId: string; reason: string }>;
}

export interface CheckoutValidation {
  valid: boolean;
  errors: string[];
}

/* =========================================================
   Constants / Invariants
   ========================================================= */

export const CART_RULES = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  DEFAULT_CURRENCY: "usd",
} as const;

export const CART_STORAGE_KEY = "cart-guest-items";

/* =========================================================
   Cart Store Types
   ========================================================= */

export type CartItemLoadingKey = "add" | "update" | "remove";

export interface CartUiLoading {
  add: Record<string, boolean>;
  update: Record<string, boolean>;
  remove: Record<string, boolean>;
  checkout: boolean;
  sync: boolean;
}

export interface CartStoreState {
  guestItems: GuestCartItem[];
  loading: CartUiLoading;
  isHydrated: boolean;
}

export interface CartStoreActions {
  addGuestItem: (item: GuestCartItem) => void;
  removeGuestItem: (productId: string) => void;
  updateGuestItemQuantity: (productId: string, quantity: number) => void;
  clearGuestItems: () => void;
  replaceGuestItems: (items: GuestCartItem[]) => void;
  setLoading: (key: CartItemLoadingKey, productId: string, value: boolean) => void;
  setCheckoutLoading: (value: boolean) => void;
  setSyncLoading: (value: boolean) => void;
  setHydrated: () => void;
}

export type CartStore = CartStoreState & CartStoreActions;
