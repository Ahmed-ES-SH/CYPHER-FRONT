"use client";

import React from "react";
import BlogEditor from "@/app/_components/_dashboard/Blog/BlogEditor";

export default function NewBlogPage() {
  return (
    <div className="-m-8 h-[calc(100%+64px)] flex flex-col">
      <BlogEditor />
    </div>
  );
}
