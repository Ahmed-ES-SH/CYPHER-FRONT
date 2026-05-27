"use client";
import React, { useState, useMemo } from "react";
import ArticleCard from "./ArticleCard";
import DummyPagination from "../../_global/DummyPagination";
import { useBlogPosts } from "@/src/modules/blog";
import { blogToLegacyArticleSummary } from "@/src/modules/blog";

export default function ArticlesComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const { data: postsResult, isLoading } = useBlogPosts({
    page: currentPage,
    limit: articlesPerPage,
    sortBy: "publishedAt",
    sortOrder: "DESC",
  });

  const articles = useMemo(
    () => (postsResult?.data ?? []).map(blogToLegacyArticleSummary),
    [postsResult],
  );

  const totalPages = postsResult?.meta?.lastPage ?? 1;

  if (isLoading) {
    return (
      <div className="xl:flex-1/2 w-full flex flex-col gap-12 items-start">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-48 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <div className="xl:flex-1/2 w-full flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 text-lg">No articles found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="xl:flex-1/2 w-full flex flex-col gap-12 items-start">
        {articles.map((article, index) => (
          <ArticleCard key={article.id ?? index} Article={article} />
        ))}
        <DummyPagination
          totalPages={totalPages}
          page={currentPage}
          setPage={setCurrentPage}
        />
      </div>
    </>
  );
}
