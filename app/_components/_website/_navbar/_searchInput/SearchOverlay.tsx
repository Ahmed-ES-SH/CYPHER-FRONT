"use client";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { MdClose } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { Product } from "@/src/modules/products";
import { getProductsApi } from "@/src/modules/products";
import SearchResultsDropdown from "./SearchResultsDropdown";

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setLoading(true);
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!query.trim()) return;
      try {
        const result = await getProductsApi({ search: query, limit: 10 });
        setSearchData(result.data);
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

  const openOverlay = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const closeOverlay = () => {
    setIsOpen(false);
    setQuery("");
    setShowResults(false);
    setSearchData([]);
  };

  return (
    <>
      <button
        onClick={openOverlay}
        className="xl:hidden flex items-center justify-center"
        aria-label="Open search"
      >
        <CiSearch className="size-7 text-icon-color" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-99999 flex items-start justify-center pt-24 px-4"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              onClick={closeOverlay}
            />

            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl"
            >
              <button
                onClick={closeOverlay}
                className="absolute -top-3 -right-3 size-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                <MdClose className="size-5 text-gray-600" />
              </button>

              <div className="flex items-center h-14 px-4">
                <div className="border border-gray-300 w-full flex h-11 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-3 w-full">
                    <CiSearch className="size-6 text-gray-500 shrink-0" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={handleChange}
                      placeholder="Search your favorite product..."
                      type="text"
                      className="w-full border-none outline-none ring-0 bg-transparent text-sm focus:outline-none focus:ring-0"
                    />
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                      >
                        <MdClose className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative px-2 pb-2">
                <SearchResultsDropdown
                  showResults={showResults}
                  loading={loading}
                  searchData={searchData}
                  query={query}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
