import Img from "@/app/_components/_global/Img";
import Stars from "@/app/_components/_global/Stars";
import React from "react";
import CountdownTimer from "./CountdownTimer";

interface props {
  imgsrc: string;
}

export default function CardTimer({ imgsrc }: props) {
  return (
    <>
      <h1 className="px-4 border-b border-gray-200 text-xl font-normal whitespace-nowrap">
        Deals of the week!
      </h1>
      <div>
        <div className="cursor-pointer z-[99999] h-full relative bg-white  w-full   rounded-md shadow-md overflow-hidden hover:shadow-lg duration-300 group">
          <div className="relative">
            <Img
              src="/images/glow-white.png"
              className="absolute top-0 left-0 w-full h-full object-cover -z-1"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 bg-primary opacity-50 rounded-full blur-3xl z-1"></div>
            <Img
              className="w-[420px] mx-auto z-10"
              src={imgsrc}
              alt="img-banner"
            />
          </div>
          <div className="flex items-center justify-center flex-col px-4">
            <div className="text-[18px] text-sky-400  p-2 h-[90px] text-center group">
              <p className="group-hover:underline duration-300">
                Apple AirPods Max Silver
              </p>
              <p className="group-hover:underline duration-300">
                Wireless Bluetooth
              </p>
            </div>
            <Stars goldStars={4} grayStars={1} />
            <div className=" pt-2 px-2">
              <div className="price">
                <del className=" text-gray-300 text-[14px]">$479.00</del>
                <h1 className="py-2 text-red-500 text-[18px]"> $439.00</h1>
              </div>
            </div>
            <h1 className=" text-gray-400 text-[12px] border-b px-2">
              2 - day Delivery
            </h1>
          </div>
          <CountdownTimer />
        </div>
      </div>
    </>
  );
}
