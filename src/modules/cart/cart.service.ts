import type {
  Cart,
  CartDto,
  GuestCartItem,
  AddItemDto,
  UpdateItemDto,
  ClearCartResponseDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
  CheckoutResult,
  SyncCartDto,
  SyncResult,
  CheckoutValidation,
} from "./cart.types";
import { CART_ENDPOINTS } from "./cart.endpoints";
import { toCart } from "./cart-mappers";
import { mergeGuestItemsWithCart } from "./cart-utils";
import { parseCartApiError } from "./cart.transport";
import type { Transport } from "./cart.transport";
import { getActiveCartTransport } from "./cart.transport";
import { selectOutOfStockItems } from "./cart-selectors";

/* =========================================================
   API Functions
   ========================================================= */

export async function getCartApi(transport?: Transport): Promise<Cart> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.get<CartDto>(CART_ENDPOINTS.GET);
  return toCart(raw);
}

export async function addItemApi(
  dto: AddItemDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.post<CartDto>(CART_ENDPOINTS.ADD_ITEM, dto);
  return toCart(raw);
}

export async function updateItemApi(
  itemId: string,
  dto: UpdateItemDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.patch<CartDto>(CART_ENDPOINTS.UPDATE_ITEM(itemId), dto);
  return toCart(raw);
}

export async function removeItemApi(
  itemId: string,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.delete<CartDto>(CART_ENDPOINTS.REMOVE_ITEM(itemId));
  return toCart(raw);
}

export async function clearCartApi(
  transport?: Transport,
): Promise<ClearCartResponseDto> {
  const t = transport ?? getActiveCartTransport();
  return t.delete<ClearCartResponseDto>(CART_ENDPOINTS.CLEAR);
}

export async function checkoutApi(
  dto: CheckoutRequestDto,
  transport?: Transport,
): Promise<CheckoutResult> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.post<CheckoutResponseDto>(CART_ENDPOINTS.CHECKOUT, dto);
  return { sessionId: raw.sessionId, url: raw.url };
}

export async function syncGuestCartApi(
  dto: SyncCartDto,
  transport?: Transport,
): Promise<Cart> {
  const t = transport ?? getActiveCartTransport();
  const raw = await t.post<CartDto>(CART_ENDPOINTS.SYNC, dto);
  return toCart(raw);
}

/* =========================================================
   Sync Service
   ========================================================= */

export async function syncGuestCart(
  guestItems: GuestCartItem[],
  options?: {
    transport?: Transport;
    serverCart?: Cart;
  },
): Promise<SyncResult> {
  if (guestItems.length === 0) {
    try {
      const cart = await getCartApi(options?.transport);
      return { success: true, cart };
    } catch {
      return { success: true };
    }
  }

  const serverCartItems = options?.serverCart?.items ?? [];
  const addItems = mergeGuestItemsWithCart(guestItems, serverCartItems);
  const dto: SyncCartDto = { items: addItems };

  try {
    const cart = await syncGuestCartApi(dto, options?.transport);
    return { success: true, cart };
  } catch (error) {
    const parsed = parseCartApiError(error);
    const fieldErrors = parsed.errors ?? {};
    return {
      success: false,
      errors: guestItems.map((item) => ({
        productId: item.productId,
        reason: fieldErrors[item.productId]?.[0] ?? parsed.message,
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
