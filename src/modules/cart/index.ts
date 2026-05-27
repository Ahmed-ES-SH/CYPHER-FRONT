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
  CartStore,
  CartStoreState,
  CartStoreActions,
  CartUiLoading,
  CartItemLoadingKey,
  SyncCartDto,
  SyncResult,
  CheckoutValidation,
} from "./cart.types";

/* ---------- Constants ---------- */
export {
  CART_RULES,
  CART_STORAGE_KEY,
} from "./cart.types";
export { cartKeys, CART_ENDPOINTS } from "./cart.api";
export type { QuantityValidationResult } from "./cart.api";

/* ---------- API Functions ---------- */
export {
  getCartApi,
  addItemApi,
  updateItemApi,
  removeItemApi,
  clearCartApi,
  checkoutApi,
  syncGuestCartApi,
} from "./cart.api";

/* ---------- Services ---------- */
export {
  canAddToCart,
  mergeGuestItemsWithCart,
  syncGuestCart,
  prepareAndCheckout,
  validateCheckoutPrerequisites,
} from "./cart.api";

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
} from "./cart.api";

/* ---------- Mappers ---------- */
export {
  toCart,
  toCartItem,
  toGuestCartItem,
} from "./cart.api";

/* ---------- Money Utilities ---------- */
export {
  createMoney,
  addMoney,
  multiplyMoney,
} from "./cart.api";

/* ---------- Quantity Validation ---------- */
export {
  validateQuantity,
} from "./cart.api";

/* ---------- Error Utilities ---------- */
export {
  parseCartApiError,
  parseCartFieldErrors,
} from "./cart.api";

/* ---------- Transport ---------- */
export {
  setCartTransport,
  getActiveCartTransport,
  defaultTransport,
} from "./cart.api";
export type { Transport } from "./cart.api";

/* ---------- Adapters ---------- */
export {
  setAuthAdapter,
  getActiveAuthAdapter,
  setStorageAdapter,
  getActiveStorageAdapter,
  setRedirectAdapter,
  getActiveRedirectAdapter,
} from "./cart.api";
export type {
  AuthAdapter,
  StorageAdapter,
  RedirectAdapter,
} from "./cart.api";

/* ---------- Query Key Helpers ---------- */
export {
  invalidateCart,
  invalidateCartDetail,
  invalidateCartCount,
} from "./cart.api";

/* ---------- Store ---------- */
export { useCartStore } from "./cart.store";
