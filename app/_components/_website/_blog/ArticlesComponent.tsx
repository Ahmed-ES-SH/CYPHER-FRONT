"use client";
import { useState, useMemo } from "react";
import { FiAlertCircle, FiRefreshCw, FiFileText } from "react-icons/fi";
import ArticleCard from "./ArticleCard";
import DummyPagination from "../../_global/DummyPagination";
import { useBlogPosts } from "@/src/modules/blog";
import { blogToLegacyArticleSummary } from "@/src/modules/blog";

export default function ArticlesComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const { data: postsResult, isLoading, isError, error, refetch } = useBlogPosts({
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
            <div className="h-8 bg-border-subtle rounded w-3/4" />
            <div className="h-4 bg-border-subtle rounded w-1/2" />
            <div className="h-48 bg-border-subtle rounded w-full" />
            <div className="h-4 bg-border-subtle rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="xl:flex-1/2 w-full flex flex-col items-center justify-center py-20">
        <div className="max-w-md text-center space-y-4">
          <div className="size-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <FiAlertCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Failed to load articles
          </h2>
          <p className="text-text-secondary text-sm">
            {error?.message ?? "Something went wrong while fetching blog posts. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-md hover:bg-dark-btn transition-colors duration-200 text-sm font-medium"
          >
            <FiRefreshCw className="size-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && !isError && articles.length === 0) {
    return (
      <div className="xl:flex-1/2 w-full flex flex-col items-center justify-center py-20">
        <div className="max-w-sm text-center space-y-4">
          <div className="size-16 mx-auto rounded-full bg-surface flex items-center justify-center">
            <FiFileText className="size-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            No articles here yet
          </h2>
          <p className="text-text-secondary text-sm">
            Check back soon for the latest reviews, buying guides, and tech insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
        Latest Articles
      </h1>
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
