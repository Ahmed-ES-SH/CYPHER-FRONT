/* eslint-disable react/no-unescaped-entities */
import Img from "@/app/_components/_global/Img";
import Link from "next/link";

export default function PhoneCard() {
  return (
    <div className="relative overflow-hidden w-full border border-border-subtle rounded-md flex flex-col items-start max-md:items-center max-md:justify-center h-[50vh] xl:h-[50vh] bg-surface-elevated">
      <div className="content px-4 w-full mt-6 m-auto z-[5]">
        <p className="firstLine w-fit h-fit text-primary-blue px-3 py-1 font-medium text-[12px] tracking-wider uppercase bg-primary-blue/10 rounded-sm">
          Super Discount
        </p>
        <p className="firstTitle font-medium py-1 text-[22px] max-md:text-[17px] text-text-primary">
          New Phone 11
        </p>
        <p className="font-normal text-text-secondary py-1 text-[13px] max-md:text-[12px]">
          Don&apos;t miss the last opportunity
        </p>
        <Link
          href={"/"}
          className="btn-shop block w-fit my-3 py-2.5 px-6 rounded-md text-white font-medium"
        >
          Shop Now
        </Link>
      </div>

      <Img
        className="w-[450px] absolute left-1/2 -translate-x-1/2 -bottom-32 object-cover z-[2]"
        src={"/images/category-1.jpg"}
        alt="iPhone 11 promotional image"
      />
    </div>
  );
}
