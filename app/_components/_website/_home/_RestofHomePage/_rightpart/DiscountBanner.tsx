import React from "react";
import { FaTag } from "react-icons/fa";

export default function DiscountBanner() {
  return (
    <div className="bg-dark-btn relative w-full rounded-md overflow-hidden py-6">
      <div className="content px-6 flex items-center justify-between w-full">
        <div className="text">
          <h1 className="text-[16px] font-medium text-white">
            Super discount for your first purchase
          </h1>
          <p className="text-[13px] text-white/60 mt-1">
            Use discount code at checkout.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-md px-4 py-2">
          <FaTag className="text-primary-yellow" />
          <span className="text-primary-yellow font-mono font-semibold tracking-wider text-[14px]">FREE256MAC</span>
        </div>
      </div>
    </div>
  );
}
