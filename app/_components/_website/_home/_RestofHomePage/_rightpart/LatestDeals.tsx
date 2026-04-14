import Img from "@/app/_components/_global/Img";
import Stars from "@/app/_components/_global/Stars";
import { LatestDealsContent } from "@/constants/constantsDetails";
import React from "react";
import MainHead from "./MainHead";
import Link from "next/link";
import { formatTitle } from "@/app/helpers/helpers";

export default function LatestDeals() {
  return (
    <div className="py-3 my-4 px-2 rounded-md">
      <MainHead title={"Latest Deals"} />
      <div className="latest flex max-lg:flex-col items-center gap-3 w-full justify-between">
        {LatestDealsContent.map((deal, index) => {
          const soldPercent = deal.available && deal.Solid
            ? Math.round((deal.Solid / (deal.available + deal.Solid)) * 100)
            : 50;
          return (
            <Link
              key={deal.id}
              href={`/products/${formatTitle(deal.title)}?productId=${deal.id}`}
              className="flex-1 group cursor-pointer max-lg:w-full border border-border-subtle rounded-md p-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200 bg-surface-elevated"
            >
              <Img
                className={`rounded-md ${index === 0 ? "w-[120px]" : "w-[150px]"}`}
                src={deal.img || "/images/placeholder.webp"}
                alt={deal.title}
              />
              <div className="content w-full">
                <h1 className="group-hover:text-primary-blue transition-all duration-200 text-[14px] font-medium text-text-primary py-1">
                  {deal.title}
                </h1>
                <Stars
                  goldStars={Number(deal.stars)}
                  grayStars={5 - Number(deal.stars)}
                />
                <div className="price flex items-center gap-2 mt-1">
                  <del className="text-text-muted text-[13px]">
                    ${deal.price}
                  </del>
                  <h1 className="text-primary-blue font-bold text-[17px]">
                    ${deal.priceAfterDiscount}
                  </h1>
                </div>
                <div className="progress relative rounded-full bg-border-subtle w-full h-[4px] mt-2">
                  <span
                    className="absolute rounded-full h-full bg-primary-yellow z-[2]"
                    style={{ width: `${soldPercent}%` }}
                  ></span>
                </div>
                <div className="available-solid py-1.5 flex items-center justify-between w-full">
                  <h1 className="text-[11px] text-text-muted">
                    Available: {deal.available}
                  </h1>
                  <h1 className="text-[11px] text-text-muted">
                    Sold: {deal.Solid}
                  </h1>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
