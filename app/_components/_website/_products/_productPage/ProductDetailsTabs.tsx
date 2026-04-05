"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaStar } from "react-icons/fa";
import { RiProductHuntLine } from "react-icons/ri";
import { formatDateTime } from "@/app/helpers/formatTime";
import { ProductType } from "@/app/types/productType";
import { keyFeatures } from "./constants";

type spec = {
  label: string;
  value: string;
};

interface ProductDetailsTabsProps {
  product: ProductType;
  specs: spec[];
}

export default function ProductDetailsTabs({
  product,
  specs,
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="mt-16"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "description", label: "Description" },
            { id: "specification", label: "Specification" },
            {
              id: "reviews",
              label: `Reviews (${product.reviews.length})`,
            },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2 }}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="prose max-w-none"
            >
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {product.description}
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <RiProductHuntLine className="mr-2 text-gray-600" />
              Key Features:
            </h3>

            <ul className="space-y-3">
              {keyFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <FaCheck className="text-green-500 mt-1 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
            </motion.div>
          )}

          {activeTab === "specification" && (
            <motion.div
              key="specification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2 gap-8"
            >
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                General
              </h3>
              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="font-medium text-gray-800">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Technical Specs
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Processor</span>
                  <span className="font-medium text-gray-800">A14 Bionic</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium text-gray-800">64GB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Connectivity</span>
                  <span className="font-medium text-gray-800">
                    Wi-Fi + Cellular
                  </span>
                </div>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start gap-6"
            >
            {product.reviews.map((review) => (
              <div
                key={review.data}
                className="bg-white rounded-lg border border-gray-200 p-6 w-full"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {review.reviewerName}
                    </h4>
                    <p className="text-[11px] mb-1">{review.reviewerEmail}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {Array.from({ length: review.rating }).map(
                          (_, index) => (
                            <FaStar
                              key={index}
                              className="text-yellow-400 text-sm"
                            />
                          ),
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
