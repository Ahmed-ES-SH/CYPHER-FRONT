import React from "react";
import Img from "../../../../_global/Img";
import { dualBannerDetails } from "@/constants/constantsDetails";
import Link from "next/link";

export default function DualBanner() {
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
      {dualBannerDetails.map((item, index) => (
        <div key={index} className="relative h-[35vh] w-full overflow-hidden rounded-md">
          <Img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-btn/70 to-dark-btn/20" />
          <div className="content z-20 absolute left-8 top-1/2 -translate-y-1/2 max-md:left-4 max-md:top-[55%]">
            <p className="firstLine w-fit h-fit text-white bg-primary-blue/90 rounded-sm duration-200 py-1 px-3 font-medium text-[12px] tracking-wider uppercase">
              Limited Offer
            </p>
            <p className="firstTitle font-medium py-1 text-3xl max-md:text-2xl text-white drop-shadow">
              {item.title}
            </p>
            <p className="py-2 text-[15px] text-white/80">{item.desc}</p>
            <Link
              href={"/shop"}
              className="btn-shop py-2 px-5 bg-primary-yellow text-dark-btn hover:bg-white duration-200 font-semibold rounded-md inline-block mt-1"
            >
              Shop Now
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
