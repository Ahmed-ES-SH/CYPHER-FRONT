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
            delay: 2500,
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
                <div className="content absolute left-14 top-1/2 -translate-y-1/2 max-md:left-2 max-md:top-[60%]">
                  <p className="firstLine text-gray-800 mb-2 w-fit h-fit rounded-full bg-primary p-1 px-2 font-normal text-[14px]">
                    WEEKEND DISCOUNT
                  </p>
                  <p className="firstTitle font-medium py-1 text-5xl max-md:text-3xl text-gray-700">
                    {slide.title}
                  </p>
                  <p className=" font-bold py-1 text-7xl max-md:text-4xl text-gray-800">
                    {slide.bold_title}
                  </p>
                  <p className=" py-4 text-[20px]">
                    Last cell for up to{" "}
                    <span className="font-bold text-red-500 text-3xl">
                      {slide.disocunt_percent}
                    </span>
                    off !
                  </p>
                  <Link
                    href={"/shop"}
                    className="btn-shop block w-fit py-4 px-8 bg-primary rounded-full text-white hover:bg-cyan-700 duration-300"
                  >
                    Shop now
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
