export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductMedia {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  image?: string;
  parentId?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  stock: number;
  minimumOrderQuantity: number;
  categoryId: string;
  category?: Category;
  brand?: string;
  tags: string[];
  media: ProductMedia[];
  thumbnail?: string;
  dimensions: ProductDimensions;
  weight?: number;
  rating: number;
  reviews: ProductReview[];
  isPublished: boolean;
  availabilityStatus: string;
  createdAt: string;
  updatedAt: string;
}
