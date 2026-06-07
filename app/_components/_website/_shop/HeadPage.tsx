"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Dropdown from "./Dropdown";
import { BsArrowDown } from "react-icons/bs";
import { LuLayoutDashboard } from "react-icons/lu";
import { LiaStackExchange } from "react-icons/lia";
import { useShopContext } from "@/app/(pathes)/shop/ShopProvider";

const sortLines = [
  "Sort by latest",
  "Sort by popularity",
  "Sort by average rating",
  "Sort by price : low to high",
  "Sort by price : hight to low",
];

const showingLines = ["16 items", "32 items", "48 items", "64 items"];

export default function HeadPage() {
  const ctx = useShopContext();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isShowOpen, setIsShowOpen] = useState(false);

  const sortContainerRef = useRef<HTMLDivElement>(null);
  const showContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortContainerRef.current &&
        !sortContainerRef.current.contains(e.target as Node)
      ) {
        setIsSortOpen(false);
      }
      if (
        showContainerRef.current &&
        !showContainerRef.current.contains(e.target as Node)
      ) {
        setIsShowOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortText = useMemo(() => {
    if (ctx.sortBy === "createdAt") return sortLines[0];
    if (ctx.sortBy === "rating") return sortLines[1];
    if (ctx.sortBy === "price" && ctx.sortOrder === "asc")
      return sortLines[3];
    if (ctx.sortBy === "price" && ctx.sortOrder === "desc")
      return sortLines[4];
    return sortLines[0];
  }, [ctx.sortBy, ctx.sortOrder]);

  const handleSortSelect = (text: string) => {
    switch (text) {
      case sortLines[0]:
        ctx.onSortChange("createdAt", "desc");
        break;
      case sortLines[1]:
      case sortLines[2]:
        ctx.onSortChange("rating", "desc");
        break;
      case sortLines[3]:
        ctx.onSortChange("price", "asc");
        break;
      case sortLines[4]:
        ctx.onSortChange("price", "desc");
        break;
    }
    setIsSortOpen(false);
  };

  const handleShowSelect = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num)) ctx.onLimitChange(num);
    setIsShowOpen(false);
  };

  const showingText = `${ctx.limit} items`;

  return (
    <>
      <div className="mt-4 flex items-center justify-between w-full border-b border-gray-200 pb-3">
        <p className="text-[13px] max-md:hidden">
          {ctx.total > 0
            ? `showing ${ctx.showingStart}–${ctx.showingEnd} of ${ctx.total} results`
            : ""}
        </p>
        <div className="flex items-center gap-3 text-[13px]">
          <div className="border-r relative" ref={sortContainerRef}>
            <div
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer hover:text-primary-blue duration-300"
            >
              <p className="whitespace-normal">{currentSortText}</p>
              <BsArrowDown className="text-icon-color mr-2" width={12} />
            </div>
            {isSortOpen && (
              <Dropdown
                lines={sortLines}
                isOpen={true}
                onClose={() => {}}
                onClick={handleSortSelect}
              />
            )}
          </div>

          <div className="border-r relative" ref={showContainerRef}>
            <div
              onClick={() => setIsShowOpen((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer hover:text-primary-blue duration-300"
            >
              <p>Showing : </p>
              <span className="flex items-center gap-2">
                {showingText}
                <BsArrowDown className="text-gray-300 mr-2" width={12} />
              </span>
            </div>
            {isShowOpen && (
              <Dropdown
                lines={showingLines}
                isOpen={true}
                onClose={() => {}}
                onClick={handleShowSelect}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => ctx.onGridViewChange("grid")}
              className={
                ctx.gridView === "grid" ? "text-primary-blue" : "text-gray-300"
              }
            >
              <LuLayoutDashboard width={15} />
            </button>
            <button
              onClick={() => ctx.onGridViewChange("list")}
              className={
                ctx.gridView === "list"
                  ? "text-primary-blue"
                  : "text-gray-300"
              }
            >
              <LiaStackExchange width={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
