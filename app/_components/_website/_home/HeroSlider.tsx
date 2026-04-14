"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Autoplay } from "swiper/modules";
import Img from "../../_global/Img";
import { SliderContent } from "@/constants/constantsDetails";
import { useListToggle } from "@/app/store/ListToggle";

import "swiper/css";
import "swiper/css/effect-creative";
import Link from "next/link";

export default function HeroSlider() {
  const { isOpen } = useListToggle();
  return (
    <>
      <div
        className={` ${
          isOpen ? "xl:w-[80%] w-full" : "w-full"
        } shadow-lg duration-700  rounded-md  mt-2`}
      >
        <Swiper
          grabCursor={true}
          effect={"creative"}
          loopAdditionalSlides={3}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          creativeEffect={{
            prev: {
              shadow: true,
              translate: [0, 0, -400],
            },
            next: {
              translate: ["100%", 0, 0],
            },
          }}
          modules={[EffectCreative, Autoplay]}
        >
          {SliderContent.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`w-full  h-[60vh] relative`}>
                <Img
                  src={slide.img_src}
                  className="w-full h-full object-cover object-center absolute inset-0 -z-10"
                  alt="Hero Image"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-btn/80 via-dark-btn/40 to-transparent" />
                <div className="content absolute left-14 top-1/2 -translate-y-1/2 max-md:left-4 max-md:top-[55%] z-10">
                  <p className="firstLine text-white mb-3 w-fit h-fit rounded-sm bg-primary-blue/90 px-3 py-1 text-[13px] font-medium tracking-wider uppercase">
                    Weekend Discount
                  </p>
                  <p className="firstTitle font-medium py-1 text-5xl max-md:text-3xl text-white drop-shadow-lg">
                    {slide.title}
                  </p>
                  <p className="font-bold py-1 text-7xl max-md:text-4xl text-white drop-shadow-lg" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {slide.bold_title}
                  </p>
                  <p className="py-4 text-[20px] text-white/90">
                    Last call for up to{" "}
                    <span className="font-bold text-primary-yellow text-3xl">
                      {slide.disocunt_percent}
                    </span>
                    off!
                  </p>
                  <Link
                    href={"/shop"}
                    className="btn-shop inline-block mt-2 bg-primary-yellow text-dark-btn hover:bg-white duration-200 font-semibold rounded-md px-8 py-3"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
