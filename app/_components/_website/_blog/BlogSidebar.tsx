"use client";
import React, { useEffect, useState } from "react";
import Img from "../../_global/Img";
import { FaTimes } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { BsLayoutTextSidebar } from "react-icons/bs";
import { useVariables } from "@/app/context/VariablesContext";
import InputSearchArticles from "./InputSearchArticles";
import Link from "next/link";
import { formatTitle } from "@/app/helpers/helpers";
import { articles } from "@/constants/Articles";

export default function BlogSidebar() {
  const { width } = useVariables();

  const [showSidebar, setShowSidebar] = useState(false);

  const categories = [
    { name: "Innovation", count: 5 },
    { name: "Smartphone", count: 8 },
    { name: "Creator Tools", count: 3 },
    { name: "Foldables", count: 12 },
    { name: "Gaming", count: 1 },
    { name: "Android", count: 4 },
  ];

  const tags = [
    "iphone",
    "apple",
    "technology",
    "samsung",
    "galaxy",
    "google",
    "oneplus",
    "huawei",
    "xiaomi",
    "sony",
    "nothing",
    "motorola",
    "gaming",
  ];

  const ToggleFilter = () => {
    setShowSidebar((prev) => !prev);
  };

  useEffect(() => {
    if (width > 1280) {
      setShowSidebar(true);
    }
  }, [width]);

  return (
    <>
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="xl:flex-1 xl:sticky fixed top-0  left-0 xl:top-4 xl:right-0 bg-white max-xl:px-4 max-xl:py-12 overflow-y-auto max-md:w-[80%] custom-scrollbar max-xl:h-screen max-xl:w-[420px]"
          >
            <FaTimes
              onClick={ToggleFilter}
              className=" absolute top-3 right-4 text-dark-btn hover:opacity-70 cursor-pointer duration-300"
            />
            <InputSearchArticles />

            {/* Categories Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark-btn mb-4 pb-2 border-b border-gray-200">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 group/cat"
                  >
                    <Link
                      href={`/blog/categories/${formatTitle(category.name)}`}
                      className="text-gray-600 group-hover/cat:text-primary-blue transition-colors text-sm font-medium"
                    >
                      {category.name}
                    </Link>
                    <span className="text-icon-color text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark-btn mb-4 pb-2 border-b border-gray-200">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blog/tags/${formatTitle(tag)}`}
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-blue hover:text-white transition-all duration-300 border border-transparent"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Posts Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Popular Posts
              </h3>
              <div className="space-y-4">
                {articles.slice(0, 3).map((post) => (
                  <Link
                    href={`/blog/${formatTitle(post.title)}?articleId=${
                      post.id
                    }`}
                    key={post.tags[0]}
                    className="flex gap-3"
                  >
                    <div className="w-16 h-12 flex-shrink-0 overflow-hidden">
                      <Img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">
                        {post.category}
                      </div>
                      <h4 className="text-sm text-gray-900 leading-tight hover:text-gray-700 cursor-pointer">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Samsung Advertisement */}
            <div className="bg-gray-50 text-center py-8 px-6">
              <div className="relative">
                <Img
                  src="/images/widget-banner.jpg"
                  alt="Samsung Galaxy S24 5G"
                  className="w-full  object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSidebar && (
        <div
          onClick={ToggleFilter}
          className="w-14 h-14 z-[999] rounded-full fixed bottom-6 right-4 flex items-center justify-center cursor-pointer bg-primary-blue hover:bg-sky-500 text-white duration-300"
        >
          <BsLayoutTextSidebar className="size-8" />
        </div>
      )}
    </>
  );
}
