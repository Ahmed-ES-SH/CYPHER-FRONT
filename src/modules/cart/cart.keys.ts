export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
  itemCount: () => [...cartKeys.all, "count"] as const,
  checkout: () => [...cartKeys.all, "checkout"] as const,
  mutations: () => [...cartKeys.all, "mutations"] as const,
};
