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
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="origin-top bg-surface-elevated mt-1 shrink-0 w-[280px] max-h-[61vh] overflow-y-auto rounded-md shadow-lg overflow-hidden max-xl:hidden border border-border-subtle"
        >
          <div className="flex flex-col divide-y divide-border-subtle">
            {menuData.map((item, index) => (
              <Link
                href="/shop"
                key={index}
                className="flex items-center justify-between px-4 py-3 flex-1 hover:bg-surface cursor-pointer transition-colors duration-150"
              >
                <div className="flex items-center space-x-3 w-full">
                  <item.icon className="w-5 h-5 text-text-secondary" />
                  <span className="text-text-primary whitespace-nowrap font-medium text-[14px]">
                    {item.text}
                  </span>
                  {item.badge && (
                    <span className="bg-primary-yellow text-dark-btn text-[10px] px-2 py-0.5 rounded-sm font-semibold ml-auto whitespace-nowrap tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.hasArrow && (
                  <MdChevronRight className="w-5 h-5 text-text-muted" />
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
