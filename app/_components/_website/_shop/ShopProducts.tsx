"use client";
import { useEffect, useState } from "react";
import { ProductType } from "@/app/types/productType";
import { AiOutlineLoading } from "react-icons/ai";
import { motion } from "framer-motion";
import { useVariables } from "@/app/context/VariablesContext";
import { useData } from "@/app/context/DataContext";
import ProductCard from "../_products/ProductCard";
import DummyPagination from "../../_global/DummyPagination";
import SelectedCategories from "./SelectedCategories";

export default function ShopProducts() {
  const { categories } = useVariables();
  const { categoryData } = useData();

  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const limit = 16;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const skip = (page - 1) * limit;
        const res = await fetch(
          `https://dummyjson.com/products?limit=${limit}&skip=${skip}`,
        );
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / limit));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    if (categories.length === 0) {
      fetchProducts();
    }
  }, [page, categories.length]);

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

  const paginatedCategoryData = showCategoryProducts
    ? categoryData.slice((page - 1) * limit, page * limit)
    : [];

  const currentData = showCategoryProducts ? paginatedCategoryData : products;

  if (loading)
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
          {currentData.map((product: ProductType, index: number) => (
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
