"use client";
import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "../_products/ProductCard";
import SelectedCategories from "./SelectedCategories";
import { useVariables } from "@/app/context/VariablesContext";
import DummyPagination from "../../_global/DummyPagination";
import { useData } from "@/app/context/DataContext";
import { useProducts } from "@/src/modules/products";
import { productToLegacy } from "@/src/modules/products";

export default function LaptopsShop() {
  const { categoryData, categories: currentCats } = useData();
  const { categories, setCategories } = useVariables();

  // Fetch laptops via the products module
  const { data: laptopsResult } = useProducts({
    categorySlug: "laptops",
    limit: 50,
  });

  const laptops = useMemo(
    () => (laptopsResult?.data ?? []).map(productToLegacy),
    [laptopsResult],
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [products, setProducts] = useState(laptops);

  // Sync laptops data when it loads
  useEffect(() => {
    if (laptops.length > 0) {
      setProducts(laptops);
    }
  }, [laptops]);

  const limit = 16;

  useEffect(() => {
    if (categories.length > 0) {
      setShowCategoryProducts(true);
      setPage(1);
    } else {
      setShowCategoryProducts(false);
      setPage(1);
    }
  }, [categories]);

  useEffect(() => {
    const totalItems = showCategoryProducts
      ? categoryData.length
      : products.length;
    setTotalPages(Math.ceil(totalItems / limit));
  }, [categoryData, products.length, showCategoryProducts, limit]);

  const paginatedData = showCategoryProducts ? categoryData : products;
  const currentData = paginatedData.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (currentCats) setCategories([currentCats[6]]);
  }, [currentCats, setCategories]);

  return (
    <>
      <div className="flex-1/2 h-full relative py-2">
        <SelectedCategories />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 justify-items-center">
          {currentData.map((product: any, index: number) => (
            <ProductCard key={index} product={product} />
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
