import { leftCornerFirst } from "@/constants/constantsDetails";
import React from "react";

export default function Features() {
  return (
    <div className="h-full w-full rounded-md bg-surface-elevated border border-border-subtle">
      {leftCornerFirst.map((line, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-between max-xl:justify-start gap-5 p-4 not-last:border-b border-border-subtle"
        >
          <line.icon className="text-primary-blue size-7 shrink-0" />
          <div className="content leading-snug">
            <h1 className="font-medium text-[15px] whitespace-nowrap text-text-primary">
              {line.title}
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5">{line.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
