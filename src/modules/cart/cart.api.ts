/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  Cart,
  CartItem,
  CartSummary,
  CartDto,
  CartItemDto,
  GuestCartItem,
  AddItemDto,
  UpdateItemDto,
  ClearCartResponseDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
  CheckoutResult,
  SyncCartDto,
  Money,
  CartApiError,
  CartValidationErrorMap,
  SyncResult,
  CheckoutValidation,
} from "./cart.types";
import { CART_RULES } from "./cart.types";

/* =========================================================
   Transport Interface + Adapter
   ========================================================= */

export interface Transport {
  get<T = any>(endpoint: string): Promise<T>;
  post<T = any>(endpoint: string, body?: unknown): Promise<T>;
  patch<T = any>(endpoint: string, body?: unknown): Promise<T>;
  delete<T = any>(endpoint: string): Promise<T>;
}

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode ?? 500 } satisfies CartApiError;
  }
  return res.data as TResult;
}

export const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setCartTransport(transport: Transport) {
  activeTransport = transport;
}

export function getActiveCartTransport(): Transport {
  return activeTransport;
}

/* =========================================================
   Auth Adapter
   ========================================================= */

export interface AuthAdapter {
  userId: string | null;
  isAuthenticated: boolean;
}

const defaultAuthAdapter: AuthAdapter = {
  userId: null,
  isAuthenticated: false,
};

let activeAuthAdapter: AuthAdapter = defaultAuthAdapter;

export function setAuthAdapter(adapter: AuthAdapter) {
  activeAuthAdapter = adapter;
}

export function getActiveAuthAdapter(): AuthAdapter {
  return activeAuthAdapter;
}

/* =========================================================
   Storage Adapter
   ========================================================= */

export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

const defaultStorageAdapter: StorageAdapter = {
  getItem: <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded */ }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch { /* noop */ }
  },
};

let activeStorageAdapter: StorageAdapter = defaultStorageAdapter;

export function setStorageAdapter(adapter: StorageAdapter) {
  activeStorageAdapter = adapter;
}

export function getActiveStorageAdapter(): StorageAdapter {
  return activeStorageAdapter;
}

/* =========================================================
   Redirect Adapter
   ========================================================= */

export interface RedirectAdapter {
  to(url: string): void;
  replace(url: string): void;
}

const defaultRedirectAdapter: RedirectAdapter = {
  to: (url) => { window.location.href = url; },
  replace: (url) => { window.location.replace(url); },
};

let activeRedirectAdapter: RedirectAdapter = defaultRedirectAdapter;

export function setRedirectAdapter(adapter: RedirectAdapter) {
  activeRedirectAdapter = adapter;
}

export function getActiveRedirectAdapter(): RedirectAdapter {
  return activeRedirectAdapter;
}

/* =========================================================
   Error Normalization
   ========================================================= */

export function parseCartApiError(error: unknown): CartApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message ?? "An unexpected error occurred",
      status: (error as any).status ?? 500,
      path: (error as any).path,
      timestamp: (error as any).timestamp,
      errors: (error as any).errors,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseCartFieldErrors(
  errors?: Record<string, string[]>,
): CartValidationErrorMap {
  if (!errors) return {};
  const map: CartValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* =========================================================
   Endpoint Constants
   ========================================================= */

export const CART_ENDPOINTS = {
  GET: "/api/cart",
  ADD_ITEM: "/api/cart/items",
  UPDATE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
  REMOVE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
  CLEAR: "/api/cart/clear",
  CHECKOUT: "/api/cart/checkout",
  SYNC: "/api/cart/sync",
} as const;

/* =========================================================
   Query Key Factory
   ========================================================= */

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  itemCount: () => [...cartKeys.all, "count"] as const,
  checkout: () => [...cartKeys.all, "checkout"] as const,
  mutations: () => [...cartKeys.all, "mutations"] as const,
};

/* =========================================================
   Money Utilities
   ========================================================= */

export function createMoney(amount: number, currency: string = CART_RULES.DEFAULT_CURRENCY): Money {
  return { amount: Math.round(amount), currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return createMoney(a.amount + b.amount, a.currency);
}

export function multiplyMoney(price: Money, quantity: number): Money {
  return createMoney(price.amount * quantity, price.currency);
}

/* =========================================================
   Quantity Validation
   ========================================================= */

export interface QuantityValidationResult {
  valid: boolean;
  clamped: number;
  reason?: string;
}

export function validateQuantity(
  quantity: number,
  stock: number,
  minimum = CART_RULES.MIN_QUANTITY,
  maximum = CART_RULES.MAX_QUANTITY,
): QuantityValidationResult {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { valid: false, clamped: Math.max(minimum, Math.min(minimum, maximum)), reason: "Quantity must be a positive integer" };
  }

  let clamped = quantity;

  if (clamped < minimum) {
    clamped = minimum;
  }

  if (clamped > maximum) {
    clamped = maximum;
  }

  if (clamped > stock) {
    clamped = stock;
  }

  const valid = clamped === quantity;

  return {
    valid,
    clamped,
    reason: valid ? undefined : `Quantity adjusted from ${quantity} to ${clamped}`,
  };
}

/* =========================================================
   Response Mappers (DTO -> Domain)
   ========================================================= */

export function toCartItem(dto: CartItemDto, currency: string): CartItem {
  const unitPrice = createMoney(dto.price, currency);
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName,
    productSlug: dto.productSlug,
    productImage: dto.productImage,
    unitPrice,
    quantity: dto.quantity,
    subtotal: multiplyMoney(unitPrice, dto.quantity),
    stock: dto.stock,
    minimumQuantity: dto.minimumOrderQuantity,
    maximumQuantity: dto.maximumOrderQuantity,
  };
}

export function toCart(dto: CartDto): Cart {
  const currency = dto.currency;
  const items = dto.items.map((item) => toCartItem(item, currency));
  return {
    id: dto.id,
    userId: dto.userId,
    items,
    subtotal: createMoney(dto.subtotal, currency),
    total: createMoney(dto.total, currency),
    currency,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toGuestCartItem(
  productId: string,
  productName: string,
  productSlug: string,
  productImage: string,
  unitPrice: Money,
  quantity: number,
  stock: number,
  minimumQuantity = CART_RULES.MIN_QUANTITY,
  maximumQuantity = CART_RULES.MAX_QUANTITY,
): GuestCartItem {
  return {
    productId,
    productName,
    productSlug,
    productImage,
    unitPrice,
    quantity,
    stock,
    minimumQuantity,
    maximumQuantity,
  };
}

/* =========================================================
   Selectors (Pure Derived State)
   ========================================================= */

export function selectCartSummary(cart: Cart): CartSummary {
  return {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
    currency: cart.currency,
  };
}

export function selectGuestCartSummary(items: GuestCartItem[]): CartSummary {
  const currency = items[0]?.unitPrice.currency ?? CART_RULES.DEFAULT_CURRENCY;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice.amount * item.quantity,
    0,
  );
  return {
    itemCount,
    subtotal: createMoney(subtotalAmount, currency),
    total: createMoney(subtotalAmount, currency),
    currency,
  };
}

export function selectGuestItemCount(items: GuestCartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartItemCount(cart: Cart): number {
  return cart.itemCount;
}

export function selectItemById(cart: Cart, productId: string): CartItem | undefined {
  return cart.items.find((item) => item.productId === productId);
}

export function selectGuestItemById(
  items: GuestCartItem[],
  productId: string,
): GuestCartItem | undefined {
  return items.find((item) => item.productId === productId);
}

export function selectOutOfStockItems(cart: Cart): CartItem[] {
  return cart.items.filter((item) => item.quantity > item.stock);
}

export function selectIsCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}

export function selectIsGuestCartEmpty(items: GuestCartItem[]): boolean {
  return items.length === 0;
}

export function selectItemStockWarning(item: CartItem | GuestCartItem): string | null {
  const remaining = item.stock - item.quantity;
  if (remaining <= 0) return "Out of stock";
  if (remaining <= 5) return `Only ${remaining} left`;
  return null;
}

/* =========================================================
   Cart Service
   ========================================================= */

export function canAddToCart(
  currentQuantity: number,
  requestedQuantity: number,
  stock: number,
  maximum: number,
): { allowed: boolean; reason?: string } {
  const total = currentQuantity + requestedQuantity;
  if (total > stock) {
    return { allowed: false, reason: `Only ${stock - currentQuantity} units available` };
  }
  if (total > maximum) {
    return { allowed: false, reason: `Maximum ${maximum} units per order` };
  }
  return { allowed: true };
}

export function mergeGuestItemsWithCart(
  guestItems: GuestCartItem[],
  cartItems: CartItem[],
): AddItemDto[] {
  const cartMap = new Map<string, CartItem>();
  for (const item of cartItems) {
    cartMap.set(item.productId, item);
  }

  const addItems: AddItemDto[] = [];

  for (const guest of guestItems) {
    const existing = cartMap.get(guest.productId);
    const currentQty = existing?.quantity ?? 0;
    const { clamped } = validateQuantity(
      currentQty + guest.quantity,
      guest.stock,
      guest.minimumQuantity,
      guest.maximumQuantity,
    );
    addItems.push({ productId: guest.productId, quantity: clamped });
  }

  return addItems;
}

/* =========================================================
   Sync Service
   ========================================================= */

export async function syncGuestCart(
  guestItems: GuestCartItem[],
  transport?: Transport,
): Promise<SyncResult> {
  if (guestItems.length === 0) {
    try {
      const cart = await getCartApi(transport);
      return { success: true, cart };
    } catch {
      return { success: true };
    }
  }

  const addItems = mergeGuestItemsWithCart(guestItems, []);
  try {
    const cart = await syncGuestCartApi({ items: addItems }, transport);
    return { success: true, cart };
  } catch (error) {
    const parsed = parseCartApiError(error);
    return {
      success: false,
      errors: guestItems.map((item) => ({
        productId: item.productId,
        reason: parsed.message,
      })),
    };
  }
}

/* =========================================================
   Checkout Service
   ========================================================= */

export function validateCheckoutPrerequisites(
  cart?: Cart,
  guestItems?: GuestCartItem[],
): CheckoutValidation {
  const errors: string[] = [];
  const hasCartItems = cart && cart.items.length > 0;
  const hasGuestItems = guestItems && guestItems.length > 0;

  if (!hasCartItems && !hasGuestItems) {
    errors.push("Cart is empty");
  }

  if (cart) {
    const outOfStock = selectOutOfStockItems(cart);
    if (outOfStock.length > 0) {
      errors.push("Some items are out of stock");
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function prepareAndCheckout(
  dto: CheckoutRequestDto,
  options?: {
    cart?: Cart;
    guestItems?: GuestCartItem[];
    transport?: Transport;
  },
): Promise<{ result?: CheckoutResult; validation?: CheckoutValidation }> {
  const validation = validateCheckoutPrerequisites(options?.cart, options?.guestItems);
  if (!validation.valid) {
    return { validation };
  }

  const result = await checkoutApi(dto, options?.transport);
  return { result };
}

/* =========================================================
   API Functions
   ========================================================= */

export async function getCartApi(transport?: Transport): Promise<Cart> {
  const t = transport ?? activeTransport;
  const raw = await t.get<CartDto>(CART_ENDPOINTS.GET);
  return toCart(raw);
}

export async function addItemApi(
  dto: AddItemDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? activeTransport;
  const raw = await t.post<CartDto>(CART_ENDPOINTS.ADD_ITEM, dto);
  return toCart(raw);
}

export async function updateItemApi(
  itemId: string,
  dto: UpdateItemDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? activeTransport;
  const raw = await t.patch<CartDto>(CART_ENDPOINTS.UPDATE_ITEM(itemId), dto);
  return toCart(raw);
}

export async function removeItemApi(
  itemId: string,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? activeTransport;
  const raw = await t.delete<CartDto>(CART_ENDPOINTS.REMOVE_ITEM(itemId));
  return toCart(raw);
}

export async function clearCartApi(
  transport?: Transport,
): Promise<ClearCartResponseDto> {
  const t = transport ?? activeTransport;
  return t.delete<ClearCartResponseDto>(CART_ENDPOINTS.CLEAR);
}

export async function checkoutApi(
  dto: CheckoutRequestDto,
  transport?: Transport,
): Promise<CheckoutResult> {
  const t = transport ?? activeTransport;
  const raw = await t.post<CheckoutResponseDto>(CART_ENDPOINTS.CHECKOUT, dto);
  return { sessionId: raw.sessionId, url: raw.url };
}

export async function syncGuestCartApi(
  dto: SyncCartDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? activeTransport;
  const raw = await t.post<CartDto>(CART_ENDPOINTS.SYNC, dto);
  return toCart(raw);
}

/* =========================================================
   Invalidation Helpers
   ========================================================= */

import type { QueryClient } from "@tanstack/react-query";

export function invalidateCart(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

export function invalidateCartDetail(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
}

export function invalidateCartCount(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.itemCount() });
}
