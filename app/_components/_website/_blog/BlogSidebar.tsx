"use client";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Img from "../../_global/Img";
import { FaTimes } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { BsLayoutTextSidebar } from "react-icons/bs";
import { useVariables } from "@/app/context/VariablesContext";
import InputSearchArticles from "./InputSearchArticles";
import Link from "next/link";
import { formatTitle } from "@/app/helpers/helpers";
import { useBlogPosts, blogToLegacyArticleSummary } from "@/src/modules/blog";
import { useCategories } from "@/src/modules/categories";

export default function BlogSidebar() {
  const { width } = useVariables();

  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  const ToggleFilter = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!showSidebar) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSidebar(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSidebar]);

  // Focus the sidebar when it opens on mobile
  useEffect(() => {
    if (showSidebar && width <= 1280) {
      // Small delay to let the animation start
      const timer = setTimeout(() => {
        sidebarRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSidebar, width]);

  useEffect(() => {
    if (width > 1280) {
      setShowSidebar(true);
    }
  }, [width]);

  // Fetch live categories from the API
  const { data: liveCategories, isLoading: catLoading } = useCategories();

  // Fetch a larger set of posts to derive tags
  const { data: allPostsResult } = useBlogPosts({
    limit: 50,
    sortBy: "publishedAt",
  });

  // Derive unique tags from all blog posts
  const allTags = useMemo(() => {
    const posts = allPostsResult?.data ?? [];
    const tagSet = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) {
        const slug = tag.slug ?? tag.name?.toLowerCase().replace(/\s+/g, "-");
        if (slug) tagSet.add(slug);
      }
    }
    return Array.from(tagSet).sort();
  }, [allPostsResult]);

  // Fetch popular posts via the blog module
  const {
    data: popularResult,
    isError: popularError,
    isLoading: popularLoading,
  } = useBlogPosts({
    limit: 3,
    sortBy: "publishedAt",
  });

  const popularPosts = useMemo(
    () => (popularResult?.data ?? []).map(blogToLegacyArticleSummary),
    [popularResult],
  );

  return (
    <>
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            ref={sidebarRef}
            id="blog-sidebar"
            tabIndex={-1}
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="xl:flex-1 xl:sticky fixed top-0 left-0 xl:top-4 xl:right-0 bg-surface-elevated max-xl:px-4 max-xl:py-12 overflow-y-auto max-md:w-[80%] custom-scrollbar max-xl:h-screen max-xl:w-[420px] outline-none"
          >
            <button
              onClick={ToggleFilter}
              aria-label="Close sidebar"
              className="absolute top-3 right-4 text-dark-btn hover:opacity-70 cursor-pointer duration-300 bg-transparent border-none p-1"
            >
              <FaTimes className="size-5" />
            </button>
            <InputSearchArticles />

            {/* Categories Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark-btn mb-4 pb-2 border-b border-border-subtle">
                Categories
              </h3>
              {catLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 bg-border-subtle rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(liveCategories ?? []).map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between py-1 group/cat"
                    >
                      <Link
                        href={`/blog/categories/${category.slug}`}
                        className="text-text-secondary group-hover/cat:text-primary-blue transition-colors text-sm font-medium"
                      >
                        {category.name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-dark-btn mb-4 pb-2 border-b border-border-subtle">
                Tags
              </h3>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tags/${tag}`}
                      className="px-4 py-1.5 bg-surface text-text-secondary text-xs rounded-full hover:bg-primary-blue hover:text-white transition-all duration-300 border border-transparent"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No tags available.</p>
              )}
            </div>

            {/* Popular Posts Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
                Popular Posts
              </h3>
              <div className="space-y-4">
                {popularError ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-text-muted mb-2">
                      Could not load popular posts.
                    </p>
                  </div>
                ) : popularLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-16 h-12 bg-border-subtle rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-border-subtle rounded w-1/3" />
                        <div className="h-4 bg-border-subtle rounded w-full" />
                      </div>
                    </div>
                  ))
                ) : popularPosts.length > 0 ? (
                  popularPosts.map((post) => (
                    <Link
                      href={`/blog/${formatTitle(post.title)}?articleId=${
                        post.id
                      }`}
                      key={post.id}
                      className="flex gap-3"
                    >
                      <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded">
                        <Img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-primary-blue mb-1 uppercase tracking-wide">
                          {post.category}
                        </div>
                        <h4 className="text-sm text-text-primary leading-tight hover:text-text-secondary cursor-pointer">
                          {post.title}
                        </h4>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No popular posts yet.</p>
                )}
              </div>
            </div>

            {/* Advertisement */}
            <div className="text-center py-8 px-6">
              <div className="relative">
                <Img
                  src="/images/widget-banner.jpg"
                  alt="Samsung Galaxy S24 5G"
                  className="w-full object-cover rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSidebar && (
        <div
          ref={toggleRef}
          onClick={ToggleFilter}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ToggleFilter(); } }}
          role="button"
          tabIndex={0}
          aria-label="Open sidebar"
          aria-expanded={showSidebar}
          aria-controls="blog-sidebar"
          className="w-14 h-14 z-50 rounded-full fixed bottom-6 right-4 flex items-center justify-center cursor-pointer bg-primary-blue hover:bg-primary-cyan text-white duration-300"
        >
          <BsLayoutTextSidebar className="size-8" />
        </div>
      )}
    </>
  );
}
