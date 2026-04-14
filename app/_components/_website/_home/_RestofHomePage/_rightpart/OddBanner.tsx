/* eslint-disable react/no-unescaped-entities */
"use client";
import Img from "@/app/_components/_global/Img";
import { useVariables } from "@/app/context/VariablesContext";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

interface props {
  imgsrc: string;
}

export default function OddBanner({ imgsrc }: props) {
  const { setOddBannerHeight } = useVariables();
  const ElementRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const updateBannerHeight = () => {
    if (ElementRef.current) {
      const newHeight = ElementRef.current.clientHeight;
      setOddBannerHeight(newHeight);
    }
  };

  useEffect(() => {
    updateBannerHeight();
    window.addEventListener("resize", updateBannerHeight);
    return () => {
      window.removeEventListener("resize", updateBannerHeight);
    };
  }, []);

  return (
    <div
      ref={ElementRef}
      className="z-[5] relative w-full mt-2 rounded-md shadow-lg overflow-hidden"
    >
      <div className="relative -z-[5] h-[30vh] w-full">
        <Img
          className="w-full h-full object-cover"
          src={imgsrc}
          alt="Promotional banner"
          onLoad={updateBannerHeight}
          ref={imgRef}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-btn/70 to-dark-btn/20" />
        <div className="content absolute left-8 top-1/2 -translate-y-1/2 max-md:left-4 max-md:top-[55%] z-10">
          <p className="firstLine text-white w-fit h-fit bg-primary-blue/90 rounded-sm py-1 px-3 font-medium text-[12px] tracking-wider uppercase">
            Featured
          </p>
          <p className="font-medium text-white py-1 text-[22px] max-md:text-[17px] drop-shadow">
            Momentum 3 Headphone
          </p>
          <p className="font-normal text-white/80 py-1 text-[14px] max-md:text-[12px]">
            Don&apos;t miss the last opportunity
          </p>
          <Link
            href={"/shop"}
            className="btn-shop mt-3 block w-fit py-2 px-5 bg-primary-yellow text-dark-btn hover:bg-white duration-200 font-semibold rounded-md"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
