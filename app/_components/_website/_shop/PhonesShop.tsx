"use client";
import React from "react";
import ProductCard from "../_products/ProductCard";
import SelectedCategories from "./SelectedCategories";
import DummyPagination from "../../_global/DummyPagination";
import { useShopContext } from "@/app/(pathes)/shop/ShopProvider";

export default function PhonesShop() {
  const ctx = useShopContext();

  const setPage = (pageOrFn: number | ((prev: number) => number)) => {
    if (typeof pageOrFn === "function") {
      ctx.onPageChange(pageOrFn(ctx.page));
    } else {
      ctx.onPageChange(pageOrFn);
    }
  };

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
        {ctx.products.map((product: any, index: number) => (
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
