export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export type PaginationMeta = {
  page: number;
  limit: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
