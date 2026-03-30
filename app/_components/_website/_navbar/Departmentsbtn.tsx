"use client";
import { useListToggle } from "@/app/store/ListToggle";
import React from "react";
import { HiOutlineBars3 } from "react-icons/hi2";
import { IoIosArrowDown } from "react-icons/io";
import NavList from "./NavList";

export default function Departmentsbtn() {
  const { toggle, isOpen } = useListToggle();
  return (
    <>
      <div
        onClick={toggle}
        className={`flex shrink-0 items-center justify-between bg-[#f7f8f9] rounded-t-lg py-4 px-2 w-[280px] cursor-pointer max-xl:hidden relative duration-300 ${isOpen ? "bg-primary/80" : ""}`}
      >
        <div className="flex items-start justify-start gap-2">
          <HiOutlineBars3 className="size-6" />
          <p className="whitespace-nowrap">All Departments</p>
        </div>
        <IoIosArrowDown className="text-icon-color" />
        <NavList />
      </div>
    </>
  );
}
