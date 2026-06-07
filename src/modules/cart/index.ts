/* =========================================================
   Public API — Cart Module
   ========================================================= */

/* ---------- Hooks ---------- */
export {
  useCart,
  useCartSummary,
  useCartCount,
  useCartActions,
  useSyncGuestCart,
  useGuestCart,
} from "./cart.hooks";

export { useUnifiedCart } from "./unified-cart.hooks";
export type { UnifiedCartItem, UnifiedCart } from "./unified-cart.hooks";

/* ---------- Types ---------- */
export type {
  Cart,
  CartItem,
  CartSummary,
  CartDto,
  CartItemDto,
  AddItemDto,
  UpdateItemDto,
  CheckoutRequestDto,
  CheckoutResult,
  GuestCartItem,
  Money,
  CartApiError,
  CartValidationErrorMap,
  SyncCartDto,
  SyncResult,
  CheckoutValidation,
} from "./cart.types";

export type {
  CartStore,
  CartStoreState,
  CartStoreActions,
} from "./cart.store";

/* ---------- Constants ---------- */
export { CART_RULES, CART_STORAGE_KEY } from "./cart.types";

/* ---------- Query Keys ---------- */
export { cartKeys } from "./cart.keys";

/* ---------- Endpoints ---------- */
export { CART_ENDPOINTS } from "./cart.endpoints";

/* ---------- API Functions ---------- */
export {
  getCartApi,
  addItemApi,
  updateItemApi,
  removeItemApi,
  clearCartApi,
  checkoutApi,
  syncGuestCartApi,
} from "./cart.service";

/* ---------- Services ---------- */
export {
  canAddToCart,
  mergeGuestItemsWithCart,
} from "./cart-utils";
export {
  syncGuestCart,
  prepareAndCheckout,
  validateCheckoutPrerequisites,
} from "./cart.service";

/* ---------- Selectors ---------- */
export {
  selectCartSummary,
  selectGuestCartSummary,
  selectGuestItemCount,
  selectCartItemCount,
  selectItemById,
  selectGuestItemById,
  selectOutOfStockItems,
  selectIsCartEmpty,
  selectIsGuestCartEmpty,
  selectItemStockWarning,
} from "./cart-selectors";

/* ---------- Mappers ---------- */
export { toCart, toCartItem, toGuestCartItem } from "./cart-mappers";

/* ---------- Money Utilities ---------- */
export { createMoney, addMoney, multiplyMoney } from "./cart-utils";

/* ---------- Quantity Validation ---------- */
export { validateQuantity } from "./cart-utils";
export type { QuantityValidationResult } from "./cart-utils";

/* ---------- Error Utilities ---------- */
export { parseCartApiError, parseCartFieldErrors } from "./cart.transport";

/* ---------- Transport ---------- */
export { setCartTransport, getActiveCartTransport, defaultTransport } from "./cart.transport";
export type { Transport } from "./cart.transport";

/* ---------- Adapters ---------- */
export {
  setAuthAdapter,
  getActiveAuthAdapter,
  setStorageAdapter,
  getActiveStorageAdapter,
  setRedirectAdapter,
  getActiveRedirectAdapter,
} from "./cart.transport";
export type {
  AuthAdapter,
  StorageAdapter,
  RedirectAdapter,
} from "./cart.transport";

export {
  createGuestCartItemFromProduct,
  isProductInCart,
  findCartItem,
} from "./adapters/cart-helpers";
export type { ProductAdapter } from "./adapters/cart-helpers";

/* ---------- Query Key Helpers ---------- */
export {
  invalidateCart,
  invalidateCartDetail,
  invalidateCartCount,
} from "./cart-invalidation";

/* ---------- Store ---------- */
export { useCartStore, initCartCrossTabSync } from "./cart.store";
