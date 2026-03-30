import React from "react";
import Img from "./Img";

export default function AnimateBackground() {
  return (
    <>
      <div id="shape-1" className="-z-1">
        <Img
          className="w-80 opacity-30 absolute top-0 right-0 animate-pulse"
          src="/shape-1.webp"
          alt="shape-1"
          width={256}
          height={256}
        />
      </div>
      <div id="shape-2" className="-z-1">
        <Img
          className="w-80 opacity-30 absolute bottom-4 left-0 animate-pulse"
          src="/shape-2.webp"
          alt="shape-2"
          width={256}
          height={256}
        />
      </div>
    </>
  );
}
