import type { Metadata } from "next";
import Loading from "@/app/_components/_global/Loading";
import ArticleComponent from "@/app/_components/_website/_blog/ArticleComponent";
import React, { Suspense } from "react";
import { getBlogPostApi } from "@/src/modules/blog";

interface ArticlePageProps {
  params: Promise<{ articleTitle: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleTitle } = await params;

  try {
    const article = await getBlogPostApi(articleTitle);

    return {
      title: `${article.title} — CYPHER Blog`,
      description: article.excerpt || article.title,
    };
  } catch {
    return {
      title: "Article Not Found — CYPHER Blog",
      description:
        "The article you're looking for doesn't exist or has been removed.",
    };
  }
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArticleComponent />
    </Suspense>
  );
}
