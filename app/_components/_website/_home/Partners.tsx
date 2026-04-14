import React from "react";
import Img from "../../_global/Img";
import { companysimages } from "@/constants/constantsDetails";

export default function Partners() {
  const companyNames = ["Brand 1", "Brand 2", "Brand 3", "Brand 4", "Brand 5", "Brand 6"];

  return (
    <div className="grid container px-4 grid-cols-[repeat(auto-fit,minmax(120px,1fr))] justify-items-center mx-auto py-8 gap-8">
      {companysimages.map((img, index) => (
        <div key={index} className="p-4 opacity-40 hover:opacity-70 transition-opacity duration-300">
          <Img
            className="object-contain w-[100px] h-[40px]"
            src={img}
            alt={companyNames[index] || "Partner brand"}
          />
        </div>
      ))}
    </div>
  );
}
