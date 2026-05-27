export type {
  Product,
  ProductDimensions,
  ProductReview,
  ProductMedia,
  Category,
} from "./types/product.types";

export type {
  CreateProductDto,
  UpdateProductDto,
  ProductQuery,
  AdminProductQuery,
  PaginatedResult,
  MutationResult,
  PublishToggleResult,
} from "./types/product-dto.types";

export type {
  ApiError,
  ValidationErrorItem,
} from "./types/product-error.types";

export { PRODUCTS_ENDPOINTS } from "./api/products.endpoints";

export {
  getProductsApi,
  getProductApi,
  getProductsByCategoryApi,
  getAdminProductsApi,
  getAdminProductApi,
  createProductApi,
  updateProductApi,
  toggleProductPublishApi,
  deleteProductApi,
} from "./api/products.api";

export {
  calculateDiscountedPrice,
  roundPrice,
  deriveAvailabilityStatus,
} from "./transformers/product-pricing";

export {
  buildProductSlug,
} from "./transformers/product-slug";

export {
  normalizeProductPayload,
  normalizeTags,
  normalizeMediaUrls,
  coercePagination,
} from "./transformers/product.mapper";

export {
  normalizeProductQuery,
  normalizeAdminProductQuery,
  serializeProductQuery,
} from "./transformers/product-query.mapper";

export {
  configureProducts,
} from "./config/products.config";

export {
  PRODUCTS_ERRORS,
} from "./constants/products.errors";

export {
  PRODUCTS_DEFAULTS,
} from "./constants/products.defaults";

export {
  productKeys,
} from "./constants/products.keys";

export {
  fetchProducts,
  fetchProduct,
  fetchProductsByCategory,
} from "./services/products.service";

export {
  fetchAdminProducts,
  fetchAdminProduct,
  createProduct,
  updateProduct,
  toggleProductPublish,
  deleteProduct,
} from "./services/products.admin.service";

export {
  useProducts,
} from "./hooks/useProducts";

export {
  useProduct,
} from "./hooks/useProduct";

export {
  useAdminProducts,
} from "./hooks/useAdminProducts";

export {
  useCreateProduct,
} from "./hooks/useCreateProduct";

export {
  useUpdateProduct,
} from "./hooks/useUpdateProduct";

export {
  useToggleProductPublish,
} from "./hooks/useToggleProductPublish";

export {
  useDeleteProduct,
} from "./hooks/useDeleteProduct";

export {
  validateCreateProduct,
  validateUpdateProduct,
} from "./validators/product.validators";

export {
  validateProductQuery,
  validateAdminProductQuery,
} from "./validators/product-query.validators";

export {
  prefetchProducts,
  prefetchProductsByCategory,
} from "./server/prefetchProducts";

export {
  prefetchProduct,
} from "./server/prefetchProduct";

export { productToLegacy } from "./adapters/productToLegacy";
export type { LegacyProduct } from "./adapters/productToLegacy";
