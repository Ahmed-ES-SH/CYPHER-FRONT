"use client";

import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import ArticleCard from "@/app/_components/_website/_blog/ArticleCard";
import { useBlogPosts } from "@/src/modules/blog";
import { blogToLegacyArticleSummary } from "@/src/modules/blog";

export default function ArticlesByTag() {
  const { tag } = useParams();

  const rawTag = Array.isArray(tag) ? tag[0] : tag;
  const normalizedTag = rawTag?.toLowerCase().replace(/-/g, " ") || "";

  const { data: postsResult, isLoading } = useBlogPosts({
    tag: normalizedTag,
    limit: 50,
  });

  const articles = useMemo(
    () => (postsResult?.data ?? []).map(blogToLegacyArticleSummary),
    [postsResult],
  );

  if (isLoading) {
    return (
      <div className="xl:flex-1/2 w-full p-6">
        <h1 className="text-3xl font-light mb-8">
          Articles tagged with:{" "}
          <span className="text-primary-blue underline">
            {normalizedTag}
          </span>
        </h1>
        <div className="flex flex-col gap-10">
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
    <div className="xl:flex-1/2 w-full p-6">
      <h1 className="text-3xl font-light mb-8">
        Articles tagged with:{" "}
        <span className="text-primary-blue underline">{normalizedTag}</span>
      </h1>

      <div className="flex flex-col gap-10">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard key={article.id} Article={article} />
          ))
        ) : (
          <p className="text-gray-500 text-center mt-20">
            No articles found with this tag.
          </p>
        )}
      </div>
    </div>
  );
}
