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
  const imgRef = useRef<HTMLImageElement>(null); // Ref for the image

  const updateBannerHeight = () => {
    if (ElementRef.current) {
      const newHeight = ElementRef.current.clientHeight;
      setOddBannerHeight(newHeight);
    }
  };

  useEffect(() => {
    // Initial measurement in case the image loads very quickly
    updateBannerHeight();

    // Add a resize listener for responsiveness
    window.addEventListener("resize", updateBannerHeight);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", updateBannerHeight);
    };
  }, []); // Run once on mount

  return (
    <div
      ref={ElementRef}
      className="z-[5] relative w-full mt-2 rounded-md shadow-lg"
    >
      <div className="relative -z-[5] h-[30vh] w-full">
        <Img
          className="w-full h-full object-cover rounded-lg"
          src={imgsrc}
          alt="image-banner"
          onLoad={updateBannerHeight} // Trigger measurement when image loads
          ref={imgRef} // Assign ref to your Img component if it forwards it, or directly to img if it's a native img
        />
        <div className="content absolute left-14 top-1/2 -translate-y-1/2 max-md:left-2 max-md:top-[60%]">
          <p className="firstLine text-white w-fit h-fit p-1 font-normal text-[14px]">
            WEEKEND DISCOUND
          </p>
          <p className="font-medium text-white py-1 text-[22px] max-md:text-[17px]">
            Momentum 3 Headphone
          </p>
          <p className="font-bold text-white py-1 text-[12px] max-md:text-[12px]">
            Dont't miss the last opportunity
          </p>
          <Link
            href={"/shop"}
            className="btn-shop mt-4 block w-fit py-2 px-4 bg-primary-blue hover:bg-sky-500 duration-300 rounded-full text-white"
          >
            Shop now
          </Link>
        </div>
      </div>
    </div>
  );
}
