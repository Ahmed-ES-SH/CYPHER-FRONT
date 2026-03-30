/* eslint-disable @typescript-eslint/no-explicit-any */
import Loading from "@/app/_components/_global/Loading";
import ArticleComponent from "@/app/_components/_website/_blog/ArticleComponent";
import { articles } from "@/constants/Articles";
import React, { Suspense } from "react";

export async function generateMetadata({ searchParams }: any) {
  const { articleId } = await searchParams;
  const article = articles.find(
    (article) => article.id.toString() === articleId,
  );
  return {
    title: `CYPHER - Blog – ${article?.title ?? "Article"}`,
    description: `CYPHER - Blog – ${
      article?.description ?? "Read our latest articles and insights."
    }`,
  };
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArticleComponent />
    </Suspense>
  );
}
