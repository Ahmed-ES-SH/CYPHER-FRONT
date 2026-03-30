"use client";
import Img from "@/app/_components/_global/Img";
import { useData } from "@/app/context/DataContext";
import { formatTitle } from "@/app/helpers/helpers";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TrendingProducts() {
  const { randomProducts } = useData();

  return (
    <div className="xl:sticky top-4 left-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-100">
        <div className="relative">
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Trending
          </span>
          {/* Animated accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute -bottom-1 left-0 right-0 h-[3px] bg-linear-to-r from-primary to-cyan-300 rounded-full origin-left"
          />
        </div>
        <span className="text-xl font-light text-gray-400 tracking-tight">
          Products
        </span>
        <span className="ml-auto text-[11px] font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
          Hot
        </span>
      </div>

      {/* Product List */}
      <div className="py-3 px-2 gap-2 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] xl:grid-cols-1">
        {randomProducts.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
          >
            <Link
              href={`/products/${formatTitle(item.title)}?productId=${item.id}`}
              className="flex items-center gap-4 p-3 rounded-xl group cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-sm"
            >
              {/* Rank Badge */}
              <span
                className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-black ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : index === 1
                    ? "bg-gray-300 text-gray-700"
                    : index === 2
                    ? "bg-orange-300 text-orange-900"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {index + 1}
              </span>

              {/* Product Image */}
              <div className="relative shrink-0 w-[70px] h-[70px] bg-gray-50 rounded-lg overflow-hidden">
                <Img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.images[0] || ""}
                  alt={item.title}
                />
                {/* Discount badge */}
                {item.discountPercentage > 0 && (
                  <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                    -{Math.round(item.discountPercentage)}%
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[15px] font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.discountPercentage > 0 && (
                    <del className="text-[12px] text-gray-400">
                      ${(item.price / (1 - item.discountPercentage / 100)).toFixed(2)}
                    </del>
                  )}
                </div>

                {/* Rating dots */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < Math.round(item.rating)
                          ? "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">
                    ({item.reviews?.length || 0})
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
