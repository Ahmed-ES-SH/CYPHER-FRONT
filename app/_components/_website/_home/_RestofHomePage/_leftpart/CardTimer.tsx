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
      <h1
        className="px-4 border-b border-border-subtle text-xl font-semibold text-text-primary whitespace-nowrap"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Deals of the Week
      </h1>
      <div>
        <div className="cursor-pointer z-[99999] h-full relative bg-surface-elevated w-full rounded-md border border-border-subtle overflow-hidden hover:shadow-lg duration-300 group">
          <div className="relative">
            <Img
              src="/images/glow-white.png"
              className="absolute top-0 left-0 w-full h-full object-cover -z-1"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 bg-primary/20 rounded-full blur-3xl z-1"></div>
            <Img
              className="w-[420px] mx-auto z-10"
              src={imgsrc}
              alt="Apple AirPods Max"
            />
          </div>
          <div className="flex items-center justify-center flex-col px-4">
            <div className="text-[18px] text-primary-blue p-2 h-[90px] text-center group">
              <p className="group-hover:underline duration-200">
                Apple AirPods Max Silver
              </p>
              <p className="group-hover:underline duration-200 text-text-secondary text-[14px]">
                Wireless Bluetooth
              </p>
            </div>
            <Stars goldStars={4} grayStars={1} />
            <div className="pt-2 px-2">
              <div className="price">
                <del className="text-text-muted text-[14px]">$479.00</del>
                <h1 className="py-2 text-primary-blue text-[18px]"> $439.00</h1>
              </div>
            </div>
            <h1 className="text-text-muted text-[12px] border-b border-border-subtle px-2 pb-1">
              2-day Delivery
            </h1>
          </div>
          <CountdownTimer />
        </div>
      </div>
    </>
  );
}
