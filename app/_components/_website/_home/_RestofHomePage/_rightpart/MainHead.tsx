import LinkAnimate from "@/app/_components/_global/LinkAnimate";
import React from "react";
interface props {
  title: string;
}

export default function MainHead({ title }: props) {
  return (
    <div className="main-head px-2 pt-8 flex items-center justify-between">
      <h1 className="block whitespace-nowrap text-2xl max-sm:text-lg font-semibold text-text-primary" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {title}
      </h1>
      <LinkAnimate title={"View all"} />
    </div>
  );
}
