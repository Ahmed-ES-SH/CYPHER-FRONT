export interface ProductsConfig {
  baseURL: string;
  onUnauthorized?: () => void;
}

let config: ProductsConfig = {
  baseURL: "",
  onUnauthorized: undefined,
};

export function configureProducts(cfg: Partial<ProductsConfig>): void {
  config = { ...config, ...cfg };
}

export function getProductsConfig(): ProductsConfig {
  return config;
}
