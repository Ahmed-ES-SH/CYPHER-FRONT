import React from "react";

export default function SubscribeSection() {
  return (
    <div className="w-full bg-dark-btn relative py-8 lg:flex lg:items-center lg:justify-center">
      <div className="flex max-lg:flex-col c-container h-fit xl:gap-40 md:gap-24 gap-12 items-center">
        <div className="flex items-center flex-wrap gap-1 md:whitespace-nowrap">
          <h4 className="text-white/70 text-[15px]">
            Get email updates about our latest shop and
          </h4>
          <span className="text-primary-yellow font-medium">special offers.</span>
        </div>
        <div className="flex items-center h-[48px] flex-1/2 w-full max-w-md">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-3/4 h-[48px] py-3 rounded-l-md bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/10 border-r-0 px-4 focus:bg-white/15 transition-colors duration-200"
          />
          <button className="px-6 whitespace-nowrap flex items-center justify-center text-dark-btn bg-primary-yellow hover:bg-white duration-200 font-semibold rounded-r-md h-[48px] transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
