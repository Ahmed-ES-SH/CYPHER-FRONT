"use client";

import React from "react";
import { useParams } from "next/navigation";
import BlogEditor from "@/app/_components/_dashboard/Blog/BlogEditor";

export default function EditBlogPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;

  return (
    <div className="-m-8 h-[calc(100%+64px)] flex flex-col">
      <BlogEditor postId={id} />
    </div>
  );
}
