import React from "react";
import Img from "../../../../_global/Img";
import { dualBannerDetails } from "@/constants/constantsDetails";
import Link from "next/link";

export default function DualBanner() {
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
      {dualBannerDetails.map((item, index) => (
        <div key={index} className="relative h-[35vh] w-full">
          <Img
            src={item.img}
            alt="img-banner"
            className="border w-full h-full object-cover shadow-lg rounded-md"
          />
          <div className="content z-20 absolute left-14 top-1/2 -translate-y-1/2 max-md:left-2 max-md:top-[60%]">
            <p className="firstLine w-fit h-fit text-white bg-primary rounded-full duration-300 py-1 px-2 font-normal text-[14px]">
              WEEKEND DISCOUND
            </p>
            <p className="firstTitle font-medium py-1 text-3xl max-md:text-2xl">
              {item.title}
            </p>
            <p className=" py-4 text-[16px]">{item.desc}</p>
            <Link
              href={"/shop"}
              className="btn-shop py-2 px-4  bg-primary  duration-300 rounded-full text-white"
            >
              Shop now
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
