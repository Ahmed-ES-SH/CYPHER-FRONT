"use client";

import React from "react";
import ProductForm from "@/app/_components/_dashboard/Products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-1">Add New Product</h2>
          <p className="text-sm text-text-secondary">Fill in the technical specifications and commercial details below.</p>
        </div>
      </div>

      {/* Add bottom padding so the sticky action bar doesn't cover the form */}
      <div className="pb-28">
        <ProductForm />
      </div>
    </div>
  );
}
