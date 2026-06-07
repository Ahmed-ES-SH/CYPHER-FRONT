import type {
  Cart,
  CartItem,
  CartDto,
  CartItemDto,
  GuestCartItem,
  Money,
} from "./cart.types";
import { CART_RULES } from "./cart.types";
import { createMoney, multiplyMoney } from "./cart-utils";

/* =========================================================
   DTO -> Domain Mappers
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

export interface ToGuestCartItemOptions {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: Money;
  quantity: number;
  stock: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
}

export function toGuestCartItem(options: ToGuestCartItemOptions): GuestCartItem {
  return {
    productId: options.productId,
    productName: options.productName,
    productSlug: options.productSlug,
    productImage: options.productImage,
    unitPrice: options.unitPrice,
    quantity: options.quantity,
    stock: options.stock,
    minimumQuantity: options.minimumQuantity ?? CART_RULES.MIN_QUANTITY,
    maximumQuantity: options.maximumQuantity ?? CART_RULES.MAX_QUANTITY,
  };
}
