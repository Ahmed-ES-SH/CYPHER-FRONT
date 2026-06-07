import type { BlogArticleSummary, BlogArticle } from "../types/blog.types";
import type { ArticleType } from "@/app/_components/_website/_blog/ArticleCard";

/**
 * Maps a BlogArticleSummary (from the blog module) to the legacy ArticleType
 * that existing blog UI components expect. Allows gradual migration without
 * rewriting every component at once.
 */
export function blogToLegacyArticleSummary(
  summary: BlogArticleSummary,
): ArticleType {
  return {
    id: summary?.id ?? "",
    title: summary?.title ?? "Untitled",
    date: summary?.publishedAt ?? summary?.createdAt ?? "",
    category: summary?.category?.name ?? "Uncategorized",
    tags: (summary?.tags ?? []).map((t) => t?.name ?? "").filter(Boolean),
    image: summary?.featuredImage ?? "",
    description: summary?.excerpt ?? "",
  };
}

/**
 * Maps a full BlogArticle to a legacy ArticleType with date from publishedAt/createdAt.
 */
export function blogToLegacyArticle(article: BlogArticle): ArticleType {
  return {
    id: article?.id ?? "",
    title: article?.title ?? "Untitled",
    date: article?.publishedAt ?? article?.createdAt ?? "",
    category: article?.category?.name ?? "Uncategorized",
    tags: (article?.tags ?? []).map((t) => t?.name ?? "").filter(Boolean),
    image: article?.featuredImage ?? "",
    description: article?.excerpt ?? "",
  };
}

export type { ArticleType };
