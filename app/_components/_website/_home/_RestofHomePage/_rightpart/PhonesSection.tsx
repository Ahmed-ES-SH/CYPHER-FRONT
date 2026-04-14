/* eslint-disable react/no-unescaped-entities */
"use client";
import Img from "@/app/_components/_global/Img";
import { DetailsMobail } from "@/constants/constantsDetails";
import React, { useEffect, useRef, useState } from "react";
import MainHead from "./MainHead";
import { useData } from "@/app/context/DataContext";
import ProductCard from "../../../_products/ProductCard";
import { useVariables } from "@/app/context/VariablesContext";
import Link from "next/link";

export default function PhonesSection() {
  const { phones } = useData();
  const { width, setPhonesSectionHeight } = useVariables();
  const currentData = phones.slice(0, 6);
  const elementRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (elementRef.current) {
      const newHeight = elementRef.current.clientHeight;
      setHeight(newHeight);
      setPhonesSectionHeight(newHeight);

      const section = document.getElementById("section-test");
      if (section) {
        section.style.setProperty("--dynamic-height", `${newHeight}px`);
      }
    }
  }, [width, phones, setPhonesSectionHeight]);

  return (
    <div>
      <MainHead title={"Smartphones & Accessories"} />
      <section
        style={{
          height: width >= 1280 ? `${height}px` : "fit-content",
        }}
        id="section-test"
        className="max-xl:flex-col flex items-start justify-between gap-4 py-3 w-full my-4"
      >
        <div className="phone-card max-xl:w-full xl:h-full h-[80vh] w-[30%] relative rounded-md overflow-hidden self-start bg-surface-elevated border border-border-subtle">
          <div className="IMAGE-CARD relative h-full">
            <Img
              className="object-cover xl:h-[70%] h-1/2 w-full"
              src={"/images/category-banner.jpg"}
              alt="Samsung Galaxy phone banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-btn/80 via-dark-btn/30 to-transparent" />
            <div className="content absolute left-6 top-6 max-md:left-4 z-10">
              <p className="firstLine w-fit h-fit text-primary-yellow px-3 py-1 font-medium text-[12px] tracking-wider uppercase bg-dark-btn/50 rounded-sm">
                Samsung
              </p>
              <p className="firstTitle font-medium py-1 text-3xl max-md:text-2xl text-white drop-shadow">
                Galaxy A46
              </p>
              <p className="py-2 text-[15px] text-white/80">
                Don&apos;t miss the last opportunity.
              </p>
              <Link href="/cellphones" className="btn-shop py-2.5 px-6 bg-primary-yellow text-dark-btn hover:bg-white duration-200 font-semibold rounded-md inline-block mt-1">
                Shop Now
              </Link>
            </div>
          </div>
          <div className="details w-full absolute bottom-0 z-[10] bg-surface-elevated/95 backdrop-blur-sm py-3">
            <h1 className="title px-4 py-2 font-semibold text-text-primary text-[14px]">Cell Phones</h1>
            {DetailsMobail.map((detail, index) => (
              <div
                key={index}
                className="font-medium text-[13px] flex items-center justify-between w-full text-text-secondary py-1 px-4"
              >
                <p>{detail.title}</p>
                <p className="text-text-muted">({detail.number})</p>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={elementRef}
          className="phones max-xl:pt-[10px] w-[68%] max-xl:w-full relative"
        >
          <div className="h-full grid xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 gap-y-11 max-md:justify-items-center">
            {currentData.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
