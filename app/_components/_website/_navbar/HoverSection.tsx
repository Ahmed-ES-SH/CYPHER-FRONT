"use client";
import { useData } from "@/app/context/DataContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FaPercent } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import MiniProductCard from "../_products/MiniProductCard";

export default function HoverSection() {
  const { randomProducts } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    // Delay before opening (e.g., 200ms)
    if (!isOpen) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    // Clear any pending enter timeout
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    // Delay before closing (e.g., 300ms)
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative z-[9999] max-2xl:hidden"
    >
      {/* Trigger */}
      <div className="flex items-center gap-3 cursor-pointer group px-3 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
        <motion.div
           animate={{
             scale: [1, 1.1, 1],
             rotate: [0, 5, -5, 0],
           }}
           transition={{
             repeat: Infinity,
             duration: 3,
             ease: "easeInOut",
           }}
           className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-red-500 border-white border-2 shadow-sm"
        >
          <FaPercent className="text-white size-3" />
        </motion.div>
        <div className="content">
          <p className="font-medium text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
            Only this weekend
          </p>
          <h1 className="text-[13px] font-bold text-gray-800 whitespace-nowrap leading-tight">
            Super Discount
          </h1>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "anticipate" }}
          className="text-gray-400 group-hover:text-red-500 transition-colors"
        >
          <IoIosArrowDown />
        </motion.div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="product-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1] // Custom quintic ease
            }}
            className="c-container bg-white/95 backdrop-blur-md px-6 py-5 fixed top-[21.5%] left-1/2 -translate-x-1/2 border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[999] overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
              <div className="flex flex-col gap-0.5">
                <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">
                  Hot Deals This Week 🔥
                </h1>
                <p className="text-[14px] text-gray-500 font-medium">
                  Flash sale end in <span className="text-red-500 font-bold">24 Hours</span>. Grab them while they last!
                </p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 text-[13px] font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all">
                View All Deals
              </button>
            </div>
            
            {/* products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-stretch justify-items-center w-full">
              {randomProducts?.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <MiniProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
