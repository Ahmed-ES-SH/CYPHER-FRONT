import ArticlesComponent from "@/app/_components/_website/_blog/ArticlesComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CYPHER – Blog | Electronics & Tech Insights",
  description:
    "Expert reviews, buying guides, and the latest news on smartphones, laptops, accessories, and cutting-edge electronics. Stay ahead with CYPHER's tech blog.",
  openGraph: {
    title: "CYPHER – Blog | Electronics & Tech Insights",
    description:
      "Expert reviews, buying guides, and the latest news on smartphones, laptops, accessories, and cutting-edge electronics.",
    type: "website",
  },
};

export default function BlogPage() {
  return <ArticlesComponent />;
}
