import React from "react";
import Img from "../../_global/Img";

export default function SubscribeSection() {
  return (
    <>
      <div className="w-full overflow-hidden bg-[#041e42] relative h-[10vh]  my-4 lg:flex lg:items-center lg:justify-center py-4">
        <Img
          src="/images/discount.webp"
          className="w-full h-full z-2 absolute top-0 left-0 object-cover opacity-70 animate-ping"
        />
        <div className="flex max-lg:flex-col  c-container h-fit xl:gap-40 md:gap-24 gap-12 relative z-5">
          <div className="flex items-center flex-wrap gap-1 md:whitespace-nowrap">
            <h4 className="text-gray-400">
              Get E-mail updates about our latest shop and
            </h4>
            <span className="text-primary-yellow">special offers.</span>
          </div>
          {/* input */}
          <div className="flex items-center h-[50px] flex-1/2">
            <input
              type="text"
              className="flex-3/4 h-[50px] py-4 rounded-l-md bg-white outline-none border-none px-4"
            />
            <button className="flex-1  px-2 whitespace-nowrap flex items-center justify-center text-white bg-primary-yellow hover:bg-yellow-500 duration-300 rounded-r-md h-[50px]">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
