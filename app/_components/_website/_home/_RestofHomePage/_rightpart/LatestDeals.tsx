import Img from "@/app/_components/_global/Img";
import Stars from "@/app/_components/_global/Stars";
import { LatestDealsContent } from "@/constants/constantsDetails";
import React from "react";
import MainHead from "./MainHead";
import Link from "next/link";
import { formatTitle } from "@/app/helpers/helpers";

export default function LatestDeals() {
  return (
    <>
      <>
        <div className="py-3  my-4 px-2 rounded-md">
          <MainHead title={"Latest Deals"} />
          <div className="latest flex max-lg:flex-col items-center gap-2 w-full justify-between ">
            {LatestDealsContent.map((deal, index) => (
              <Link
                key={index}
                href={`/products/${formatTitle(deal.title)}?productId=${deal.id}`}
                className="flex-1 group cursor-pointer max-lg:w-full borer shadow-lg rounded-md p-2 flex items-center gap-2 justify-between"
              >
                <Img
                  className={`rounded-md ${index === 0 ? "w-[120px]" : "w-[150px]"}`}
                  src={deal.img || "/public"}
                  alt="image-Latest"
                />
                <div className="content w-full">
                  <h1 className="w-1/2 group-hover:text-primary-blue transition-all duration-300 max-md:w-full text-[14px] py-2 ">
                    {deal.title}
                  </h1>
                  <Stars
                    goldStars={Number(deal.stars)}
                    grayStars={5 - Number(deal.stars)}
                  />
                  <div className="price flex items-center gap-2">
                    <del className=" text-gray-300 text-[14px]">
                      ${deal.price}
                    </del>
                    <h1 className="py-2 text-red-500 text-[18px]">
                      ${deal.priceAfterDiscount}
                    </h1>
                  </div>
                  <div className="progress relative rounded-lg bg-gray-300 w-full h-[5px]">
                    <span className=" absolute rounded-lg w-1/2 h-full bg-yellow-300 z-[222]"></span>
                  </div>
                  <div className="available-solid py-2 flex items-center justify-between w-full">
                    <h1 className="text-[12px] text-gray-300">
                      Available: {deal.available}
                    </h1>
                    <h1 className="text-[12px] text-gray-300">
                      Solid: {deal.Solid}
                    </h1>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </>
    </>
  );
}
