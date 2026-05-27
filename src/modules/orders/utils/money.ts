import type { Money } from "../contracts/order.types";

const DEFAULT_DECIMALS = 2;

export function centsToUnits(cents: number, decimals = DEFAULT_DECIMALS): number {
  return Math.round(cents) / Math.pow(10, decimals);
}

export function unitsToCents(units: number, decimals = DEFAULT_DECIMALS): number {
  return Math.round(units * Math.pow(10, decimals));
}

export function formatAmount(amount: number, decimals = DEFAULT_DECIMALS): number {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function isZeroMoney(money: Money): boolean {
  return money.amount === 0;
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiplyMoney(money: Money, multiplier: number): Money {
  return { amount: money.amount * multiplier, currency: money.currency };
}
