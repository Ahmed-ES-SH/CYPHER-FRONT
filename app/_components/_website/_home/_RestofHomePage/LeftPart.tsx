import React from "react";
import Features from "./_leftpart/Features";
import PhoneCard from "./_leftpart/PhoneCard";
import CardTimer from "./_leftpart/CardTimer";
import FixedPart from "./_leftpart/FixedPart";

export default function LeftPart() {
  return (
    <div className="xl:flex-1 flex flex-col gap-4 w-full">
      <Features />
      <PhoneCard />
      <CardTimer imgsrc="/images/apple-air.webp" />
      <FixedPart />
    </div>
  );
}
