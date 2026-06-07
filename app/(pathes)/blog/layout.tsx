import BlogSidebar from "@/app/_components/_website/_blog/BlogSidebar";
import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="c-container mt-8 flex items-start gap-4">
        {children}
        <BlogSidebar />
      </div>
    </>
  );
}
