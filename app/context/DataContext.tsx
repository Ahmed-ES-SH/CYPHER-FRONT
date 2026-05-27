import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import type { ProductType } from "../types/productType";
import { useVariables } from "./VariablesContext";
import { useProducts } from "@/src/modules/products";
import { productToLegacy } from "@/src/modules/products";
import { useCategories } from "@/src/modules/categories";
import { getProductsByCategoryApi } from "@/src/modules/products";

export type categoryType = {
  name: string;
  slug: string;
  url: string;
};

interface DataContextType {
  products: ProductType[];
  phones: ProductType[];
  categoryData: ProductType[];
  categories: categoryType[] | null;
  loading: boolean;
  randomProducts: ProductType[];
  setRandomProducts: Dispatch<SetStateAction<ProductType[]>>;
}

const DataContext = createContext<DataContextType | null>(null);

interface ChildrenType {
  children: ReactNode;
}

export default function DataProvider({ children }: ChildrenType) {
  const { categories: selectedCategorySlugs } = useVariables();

  // Fetch products via the products module
  const {
    data: productsResult,
    isLoading: productsLoading,
  } = useProducts({ limit: 50 });

  // Fetch smartphones via the products module (category filter)
  const { data: phonesResult } = useProducts({
    categorySlug: "smartphones",
    limit: 20,
  });

  // Fetch categories via the categories module
  const { data: appCategories, isLoading: categoriesLoading } = useCategories();

  // Map to legacy types for backward compatibility
  const products = useMemo<ProductType[]>(
    () => (productsResult?.data ?? []).map(productToLegacy),
    [productsResult],
  );

  const phones = useMemo<ProductType[]>(
    () => (phonesResult?.data ?? []).map(productToLegacy),
    [phonesResult],
  );

  const [randomProducts, setRandomProducts] = useState<ProductType[]>([]);
  const [categoryData, setCategoryData] = useState<ProductType[]>([]);

  // Map categories from the categories module to the legacy format
  const categories = useMemo<categoryType[] | null>(
    () =>
      appCategories?.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        url: `/category/${cat.slug}`,
      })) ?? null,
    [appCategories],
  );

  // Pick random 6 phones
  useEffect(() => {
    if (phones.length > 0) {
      const shuffled = [...phones].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 6));
    }
  }, [phones]);

  // Fetch products by selected categories
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (selectedCategorySlugs.length === 0) {
        setCategoryData([]);
        return;
      }

      const uniqueCategories = Array.from(
        new Map(
          selectedCategorySlugs.map((cat) => [cat.slug, cat]),
        ).values(),
      );

      try {
        const results = await Promise.all(
          uniqueCategories.map((cat) =>
            getProductsByCategoryApi(cat.slug, { limit: 50 }),
          ),
        );

        const allProducts = results.flatMap(
          (result) => result?.data ?? [],
        );
        const mergedProducts = allProducts.map(productToLegacy);
        setCategoryData(mergedProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setCategoryData([]);
      }
    };

    fetchCategoryData();
  }, [selectedCategorySlugs]);

  const loading = productsLoading || categoriesLoading;

  return (
    <DataContext.Provider
      value={{
        products,
        phones,
        categories,
        loading,
        categoryData,
        randomProducts,
        setRandomProducts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used within a DataContext provider");
  }

  return context;
};
