"use client";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import ArticleCard from "@/app/_components/_website/_blog/ArticleCard";
import { useBlogPosts } from "@/src/modules/blog";
import { blogToLegacyArticleSummary } from "@/src/modules/blog";

export default function ArticlesByCategory() {
  const { category } = useParams();

  const rawCategory = Array.isArray(category) ? category[0] : category;
  const categorySlug = rawCategory?.toLowerCase().replace(/\s+/g, "-") || "";

  const { data: postsResult, isLoading } = useBlogPosts({
    category: categorySlug,
    limit: 50,
  });

  const articles = useMemo(
    () => (postsResult?.data ?? []).map(blogToLegacyArticleSummary),
    [postsResult],
  );

  const displayName = categorySlug
    .split(/[-\s]+/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-4 py-8 xl:flex-1/2">
        <h1 className="text-2xl mb-8">
          Category:{" "}
          <span className="text-primary-blue font-light underline">
            {displayName}
          </span>
        </h1>
        <div className="flex flex-col gap-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-48 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 py-8 xl:flex-1/2">
      <h1 className="text-2xl mb-8">
        Category:{" "}
        <span className="text-primary-blue font-light underline">
          {displayName}
        </span>
      </h1>

      <div className="flex flex-col gap-12">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard key={article.id} Article={article} />
          ))
        ) : (
          <p className="text-gray-500 text-center mt-20">
            No articles found in this category.
          </p>
        )}
      </div>
    </div>
  );
}
