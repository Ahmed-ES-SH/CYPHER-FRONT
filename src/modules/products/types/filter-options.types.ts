export interface FilterOptions {
  brands: string[];
  categories: FilterCategoryOption[];
  priceRange: Range;
  discountRange: Range;
  weightRange: NullableRange;
  ratingRange: Range;
  tags: string[];
  availabilityStatuses: string[];
}

export interface FilterCategoryOption {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Range {
  min: number;
  max: number;
}

export interface NullableRange {
  min: number | null;
  max: number | null;
}
