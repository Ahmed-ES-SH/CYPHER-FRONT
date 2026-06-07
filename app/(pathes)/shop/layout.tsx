"use client";
import Breadcrumb from "@/app/_components/_global/Breadcrumb";
import SliderOfRecommendedProducts from "@/app/_components/_website/_products/SliderOfRecommendedProducts";
import FirstShopSection from "@/app/_components/_website/_shop/FirstShopSection";
import HeadPage from "@/app/_components/_website/_shop/HeadPage";
import ProductsFilter from "@/app/_components/_website/_shop/ProductsFilter";
import React, { Suspense } from "react";
import ShopProvider from "./ShopProvider";

interface layoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: layoutProps) {
  return (
    <>
      <div className="c-container mt-4">
        <FirstShopSection />
        <Breadcrumb />
        <Suspense fallback={null}>
          <ShopProvider>
            <HeadPage />
            <div className="flex items-start gap-2 relative">
              <ProductsFilter />
              {children}
            </div>
          </ShopProvider>
        </Suspense>
        <SliderOfRecommendedProducts />
      </div>
    </>
  );
}
