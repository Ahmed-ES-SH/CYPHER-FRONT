"use client";
import { useListToggle } from "@/app/store/ListToggle";
import { menuData } from "@/constants/constantsDetails";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { MdChevronRight } from "react-icons/md";

export default function HeroList() {
  const { isOpen, setIsOpen } = useListToggle();

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "61vh" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="origin-top bg-primary/10 backdrop-blur-lg mt-1 shrink-0 w-[280px] h-[61vh] rounded-lg shadow-lg overflow-hidden max-xl:hidden"
        >
          <div className="divide-y divide-gray-100">
            {menuData.map((item, index) => (
              <Link
                href="/shop"
                key={index}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 w-full">
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800 whitespace-nowrap font-light">
                    {item.text}
                  </span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-auto text-[10px] whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.hasArrow && (
                  <MdChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
