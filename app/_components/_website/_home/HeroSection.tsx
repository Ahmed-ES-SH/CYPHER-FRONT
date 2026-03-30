import React from "react";
import HeroSlider from "./HeroSlider";
import HeroList from "./HeroList";
import AnimateBackground from "../../_global/AnimateBackground";

export default function HeroSection() {
  return (
    <div className="w-full relative">
      <AnimateBackground />
      <div className="c-container relative flex items-start overflow-hidden gap-4">
        <HeroList />
        <HeroSlider />
      </div>
    </div>
  );
}
