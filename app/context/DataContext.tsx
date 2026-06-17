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
import type { Product } from "@/src/modules/products";
import { useVariables } from "./VariablesContext";
import { useProducts } from "@/src/modules/products";
import { useCategories } from "@/src/modules/categories";
import { getProductsByCategoryApi } from "@/src/modules/products";

export type categoryType = {
  name: string;
  slug: string;
  url: string;
};

interface DataContextType {
  products: Product[];
  phones: Product[];
  categoryData: Product[];
  categories: categoryType[] | null;
  loading: boolean;
  randomProducts: Product[];
  setRandomProducts: Dispatch<SetStateAction<Product[]>>;
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

  const products = useMemo<Product[]>(
    () => productsResult?.data ?? [],
    [productsResult],
  );

  const phones = useMemo<Product[]>(
    () => phonesResult?.data ?? [],
    [phonesResult],
  );

  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<Product[]>([]);

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
        const mergedProducts = allProducts;
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
