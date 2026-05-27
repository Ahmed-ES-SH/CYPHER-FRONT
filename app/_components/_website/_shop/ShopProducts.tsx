"use client";
import { useEffect, useState, useMemo } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { motion } from "framer-motion";
import { useVariables } from "@/app/context/VariablesContext";
import { useData } from "@/app/context/DataContext";
import ProductCard from "../_products/ProductCard";
import DummyPagination from "../../_global/DummyPagination";
import SelectedCategories from "./SelectedCategories";
import { useProducts } from "@/src/modules/products";
import { productToLegacy } from "@/src/modules/products";

export default function ShopProducts() {
  const { categories } = useVariables();
  const { categoryData } = useData();

  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [page, setPage] = useState(1);

  const limit = 16;

  // Fetch all products via the products module
  const { data: productsResult, isLoading } = useProducts({
    limit,
    page,
  });

  const products = useMemo(
    () => (productsResult?.data ?? []).map(productToLegacy),
    [productsResult],
  );

  const totalApiPages = productsResult?.pagination?.totalPages ?? 0;

  useEffect(() => {
    if (categories.length > 0) {
      setShowCategoryProducts(true);
      setTotalPages(Math.ceil(categoryData.length / limit));
      setPage(1);
    } else {
      setShowCategoryProducts(false);
      setPage(1);
    }
  }, [categoryData, categories.length]);

  // Total pages for pagination
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (showCategoryProducts) {
      setTotalPages(Math.ceil(categoryData.length / limit));
    } else {
      setTotalPages(totalApiPages);
    }
  }, [showCategoryProducts, categoryData.length, totalApiPages, limit]);

  const paginatedCategoryData = showCategoryProducts
    ? categoryData.slice((page - 1) * limit, page * limit)
    : [];

  const currentData = showCategoryProducts ? paginatedCategoryData : products;

  if (isLoading)
    return (
      <div className="flex-1/2 h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: "360deg" }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        >
          <AiOutlineLoading className="size-32 text-primary-yellow" />
        </motion.div>
      </div>
    );

  return (
    <>
      <div className="flex-1/2 h-full relative py-2">
        <SelectedCategories />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 justify-items-center">
          {currentData.map((product, index: number) => (
            <ProductCard key={product.id ?? index} product={product} />
          ))}
        </div>

        <DummyPagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </>
  );
}
