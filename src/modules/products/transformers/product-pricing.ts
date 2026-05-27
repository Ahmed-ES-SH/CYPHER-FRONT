import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";

export function roundPrice(value: number): number {
  const factor = Math.pow(10, PRODUCTS_DEFAULTS.PRICE_DECIMALS);
  return Math.round(value * factor) / factor;
}

export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number,
): number {
  if (discountPercentage <= 0) return roundPrice(price);
  const discounted = price - (price * discountPercentage) / 100;
  return roundPrice(discounted);
}

export function deriveAvailabilityStatus(stock: number): string {
  if (stock <= 0) return "Out of Stock";
  if (stock <= PRODUCTS_DEFAULTS.MIN_STOCK_FOR_LOW) return "Low Stock";
  return "In Stock";
}
