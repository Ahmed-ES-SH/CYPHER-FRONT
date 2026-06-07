import React from "react";
import CategoryListWrapper from "@/app/_components/_dashboard/Category/CategoryListWrapper";

export const metadata = {
  title: "Categories — Dashboard",
};

export default function CategoriesPage() {
  return (
    <div>
      <CategoryListWrapper />
    </div>
  );
}
