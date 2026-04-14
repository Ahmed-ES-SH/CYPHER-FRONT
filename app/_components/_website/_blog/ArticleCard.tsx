import React from "react";
import { CiBookmark, CiClock2 } from "react-icons/ci";
import { LuTickets } from "react-icons/lu";
import Img from "../../_global/Img";
import Link from "next/link";
import { formatTitle } from "@/app/helpers/helpers";

export interface ArticleType {
  id: number;
  title: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  description: string;
}

interface Props {
  Article: ArticleType;
}

export default function ArticleCard({ Article }: Props) {
  const ArticleDetails = [
    {
      text: Article.date,
      icon: CiClock2,
    },
    {
      text: Article.category,
      icon: CiBookmark,
    },
  ];

  return (
    <div className="not-last:border-b block border-gray-200 pb-12 group">
      <h1
        id="title"
        className="xl:text-3xl md:text-2xl text-xl font-light pb-6 group-hover:text-primary-blue duration-300"
      >
        {Article.title}
      </h1>

      <div className="flex items-center flex-wrap gap-4 mt-2">
        {ArticleDetails.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 cursor-pointer not-last:border-r border-gray-300 pr-2"
          >
            <item.icon className="text-primary-blue size-4" />
            <p className="text-[12px]">{item.text}</p>
          </div>
        ))}
        <div className="flex items-center gap-1 cursor-pointer not-last:border-r border-gray-300 pr-2">
          <LuTickets className="text-primary-blue size-4" />
          <div className="flex items-center gap-1 flex-wrap">
            {Article.tags.map((text) => (
              <p className="text-[12px] text-primary-blue" key={text}>
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <Img
        src={Article.image}
        className="xl:w-[90%] w-full max-h-[70vh] mt-4"
        alt="article-img"
      />

      <p className="mt-3 lg:w-3/4 w-full">{Article.description}</p>

      <Link
        href={`/blog/${formatTitle(Article.title)}?articleId=${Article?.id}`}
        className="flex w-fit mt-4 items-center justify-center text-white rounded-md bg-primary-blue px-6 py-2 hover:bg-white hover:text-black hover:border-primary-blue hover:scale-105 border border-transparent duration-300"
      >
        Read More
      </Link>
    </div>
  );
}
