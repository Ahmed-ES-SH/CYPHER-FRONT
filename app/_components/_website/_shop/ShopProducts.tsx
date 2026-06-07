"use client";
import { AiOutlineLoading } from "react-icons/ai";
import { motion } from "framer-motion";
import { useShopContext } from "@/app/(pathes)/shop/ShopProvider";
import ProductCard from "../_products/ProductCard";
import DummyPagination from "../../_global/DummyPagination";
import SelectedCategories from "./SelectedCategories";

export default function ShopProducts() {
  const ctx = useShopContext();

  const setPage = (pageOrFn: number | ((prev: number) => number)) => {
    if (typeof pageOrFn === "function") {
      ctx.onPageChange(pageOrFn(ctx.page));
    } else {
      ctx.onPageChange(pageOrFn);
    }
  };

  if (ctx.isLoading)
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
    <div className="flex-1/2 h-full relative py-2">
      <SelectedCategories />

      <div
        className={
          ctx.gridView === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 justify-items-center"
        }
      >
        {ctx.products.map((product, index: number) => (
          <ProductCard
            key={product.id ?? index}
            product={product}
            viewMode={ctx.gridView}
          />
        ))}
      </div>

      <DummyPagination
        page={ctx.page}
        totalPages={ctx.totalPages}
        setPage={setPage}
      />
    </div>
  );
}
