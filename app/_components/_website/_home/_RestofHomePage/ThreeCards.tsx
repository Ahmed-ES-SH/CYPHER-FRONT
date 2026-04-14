import Img from "@/app/_components/_global/Img";
import { threeElement } from "@/constants/constantsDetails";
import Link from "next/link";
import React from "react";
import { BsArrowRight } from "react-icons/bs";

const categoryLinks = ["/cellphones", "/headphones", "/smartwatches"];

export default function ThreeCards() {
  return (
    <div className="grid grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1 gap-5 px-3 pt-12 pb-4 c-container">
      {threeElement.map((ele, index) => (
        <div
          key={index}
          className="w-full flex items-center gap-5 p-5 rounded-md bg-surface-elevated border border-border-subtle hover:shadow-lg transition-shadow duration-300"
        >
          <div className="image shrink-0">
            <Img
              src={ele.img}
              alt={ele.title}
              width={120}
              height={120}
              className="w-[100px] h-[100px] object-cover rounded-md"
            />
          </div>
          <div className="content">
            <h1 className="text-[17px] font-semibold text-text-primary" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {ele.title}
            </h1>
            <ul>
              {ele.nots.map((not, i) => (
                <li
                  className="py-1.5 text-text-secondary text-[13px]"
                  key={i}
                >
                  {not.trim()}
                </li>
              ))}
            </ul>
            <Link
              className="inline-flex items-center gap-1.5 text-[13px] mt-3 text-primary-blue hover:text-dark-btn font-medium transition-colors duration-200"
              href={categoryLinks[index] || "/shop"}
            >
              <span>{ele.link}</span>
              <BsArrowRight size={14} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
