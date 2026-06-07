"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useFilterOptions } from "@/src/modules/products";
import { useShopContext } from "@/app/(pathes)/shop/ShopProvider";
import { useVariables } from "@/app/context/VariablesContext";
import SearchBox from "./SearchBox";
import CategoryTree from "./CategoryTree";
import PriceRange from "./PriceRange";
import BrandSelect from "./BrandSelect";
import RatingFilter from "./RatingFilter";
import OnSaleToggle from "./OnSaleToggle";
import DiscountRange from "./DiscountRange";
import AvailabilityFilter from "./AvailabilityFilter";
import TagCloud from "./TagCloud";
import WeightRange from "./WeightRange";
import ClearAllButton from "./ClearAllButton";

export default function ProductsFilter() {
  const { activeFilters, onFilterChange, onClearFilters } = useShopContext();
  const { data, isLoading } = useFilterOptions();
  const { width } = useVariables();

  const filterOptions = data?.data;

  const [showFilter, setShowFilter] = useState(false);

  const ToggleFilter = () => setShowFilter((prev) => !prev);

  useEffect(() => {
    if (width > 1280) {
      setShowFilter(true);
    }
  }, [width]);

  const hasActiveFilters =
    !!activeFilters.search ||
    !!activeFilters.brand ||
    !!activeFilters.categoryIds ||
    !!activeFilters.minPrice ||
    !!activeFilters.maxPrice ||
    !!activeFilters.minDiscount ||
    !!activeFilters.maxDiscount ||
    !!activeFilters.minWeight ||
    !!activeFilters.maxWeight ||
    !!activeFilters.minRating ||
    !!activeFilters.tags ||
    !!activeFilters.onSale ||
    !!activeFilters.inStockOnly;

  const sharedProps = {
    activeFilters,
    onFilterChange,
  };

  const variants = {
    initial: { x: -200, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  };

  const sidebarContent = (
    <div className="space-y-5">
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>
      ) : filterOptions ? (
        <>
          <SearchBox {...sharedProps} />
          <CategoryTree filterOptions={filterOptions} {...sharedProps} />
          <PriceRange filterOptions={filterOptions} {...sharedProps} />
          <BrandSelect filterOptions={filterOptions} {...sharedProps} />
          <RatingFilter {...sharedProps} />
          <OnSaleToggle {...sharedProps} />
          <DiscountRange filterOptions={filterOptions} {...sharedProps} />
          <AvailabilityFilter {...sharedProps} />
          <TagCloud filterOptions={filterOptions} {...sharedProps} />
          <WeightRange filterOptions={filterOptions} {...sharedProps} />
          <ClearAllButton
            hasActiveFilters={hasActiveFilters}
            onClearAll={onClearFilters}
          />
        </>
      ) : (
        <p className="text-sm text-gray-400">Failed to load filter options</p>
      )}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {showFilter ? (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit={{ x: -200 }}
            transition={{ duration: 0.5 }}
            className="xl:flex-1 xl:sticky xl:h-full xl:w-full overflow-hidden w-[350px] h-screen overflow-y-auto custom-scrollbar fixed z-[999] py-4 px-4 xl:top-0 -top-4 left-0 mt-4 border-r bg-white border-gray-200"
          >
            <FaTimes
              className="text-red-300 cursor-pointer absolute top-4 right-3 hover:text-red-500 hover:scale-125 duration-300 block xl:hidden"
              onClick={ToggleFilter}
            />
            {sidebarContent}
          </motion.div>
        ) : (
          <div
            onClick={ToggleFilter}
            className="w-12 h-12 z-[999] rounded-full fixed bottom-6 right-4 flex items-center justify-center cursor-pointer bg-primary-blue hover:bg-sky-500 text-white duration-300"
          >
            <CiFilter className="size-8" />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
