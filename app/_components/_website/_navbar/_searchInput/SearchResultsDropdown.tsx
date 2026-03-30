"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ProductType } from "@/app/types/productType";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiNoEntry } from "react-icons/bi";
import SearchResultItem from "./SearchResultItem";

interface SearchResultsDropdownProps {
  showResults: boolean;
  loading: boolean;
  searchData: ProductType[];
  query: string;
}

export default function SearchResultsDropdown({
  showResults,
  loading,
  searchData,
  query,
}: SearchResultsDropdownProps) {
  return (
    <AnimatePresence>
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-2 right-2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 h-[450px] custom-scrollbar overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Search Results
                {!loading && searchData.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({searchData.length} found)
                  </span>
                )}
              </h3>

              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <AiOutlineLoading3Quarters className="w-5 h-5 text-blue-500" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Results Content */}
          <div className="max-h-96 custom-scrollbar overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="inline-block mb-4"
                >
                  <AiOutlineLoading3Quarters className="w-8 h-8 text-blue-500" />
                </motion.div>
                <p className="text-gray-600">Searching for products...</p>
              </div>
            ) : searchData.length > 0 ? (
              <div className="p-4 space-y-3">
                {searchData.map((product) => (
                  <SearchResultItem key={product.id} product={product} />
                ))}
              </div>
            ) : query.trim() ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <BiNoEntry className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  No results found
                </h4>
                <p className="text-gray-600 text-sm">
                  We couldn't find any products matching "{query}"
                </p>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
