/* eslint-disable react/no-unescaped-entities */
"use client";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import Categories from "../Categories";
import { CiSearch } from "react-icons/ci";
import { useData } from "@/app/context/DataContext";
import { ProductType } from "@/app/types/productType";
import { AnimatePresence, motion } from "framer-motion";
import { MdClose } from "react-icons/md";

import SearchResultsDropdown from "./SearchResultsDropdown";
import { getProductsApi } from "@/src/modules/products";
import { productToLegacy } from "@/src/modules/products";

export default function InputSearch() {
  const { categories } = useData();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<ProductType[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setLoading(true);
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!query.trim()) return;
      try {
        const result = await getProductsApi({ search: query, limit: 10 });
        setSearchData(result.data.map(productToLegacy));
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      fetchSearchData();
    }, 500);

    if (query.length === 0) {
      setSearchData([]);
      setShowResults(false);
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
    setSearchData([]);
  };

  return (
    <div className="relative w-full max-xl:hidden" ref={inputRef}>
      {/* Input and Button */}
      <div className="flex items-center px-2 h-[50px]">
        <div className="border border-gray-300 w-full flex h-full rounded-l-lg">
          <Categories data={categories} />
          <div className="flex items-center gap-4 p-2 w-full relative">
            <CiSearch className="size-7 text-gray-500" />
            <input
              value={query}
              onChange={handleChange}
              placeholder="Search your favorite product..."
              type="text"
              name="search"
              className="w-full border-none outline-none pr-8"
            />

            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearSearch}
                className="absolute right-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <MdClose className="w-4 h-4 text-gray-500" />
              </motion.button>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-full px-6 bg-primary hover:bg-primary/80 rounded-r-lg text-white flex items-center justify-center font-medium transition-all duration-200 shadow-lg"
        >
          Search
        </motion.button>
      </div>

      {/* Search Results Dropdown */}
      <SearchResultsDropdown
        showResults={showResults}
        loading={loading}
        searchData={searchData}
        query={query}
      />

      {/* Backdrop */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResults(false)}
            className="fixed inset-0  z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
