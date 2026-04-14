import type { Metadata } from "next";
import Loading from "@/app/_components/_global/Loading";
import ArticleComponent from "@/app/_components/_website/_blog/ArticleComponent";
import { articles } from "@/constants/Articles";
import React, { Suspense } from "react";

interface ArticlePageProps {
  searchParams: Promise<{ articleId?: string }>;
}

export async function generateMetadata({
  searchParams,
}: ArticlePageProps): Promise<Metadata> {
  const params = await searchParams;
  const article = articles.find(
    (article) => article.id.toString() === params.articleId,
  );

  if (!article) {
    return {
      title: "Article Not Found — CYPHER Blog",
      description: "The article you're looking for doesn't exist or has been removed.",
    };
  }

  return {
    title: `${article.title} — CYPHER Blog`,
    description: article.description,
  };
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArticleComponent />
    </Suspense>
  );
}
