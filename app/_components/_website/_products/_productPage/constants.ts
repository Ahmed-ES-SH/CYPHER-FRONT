import { Product } from "@/src/modules/products";

export const keyFeatures = [
  "High-performance design and premium materials",
  "Optimized for efficiency and long-term durability",
  "Includes comprehensive manufacturer warranty",
  "Rigorously tested for quality and performance",
  "Ships in secure, eco-friendly packaging",
];

export function returnSpecs(product: Product) {
  return [
    { label: "Brand", value: `${product?.brand || "Premium Brand"}` },
    { label: "Model SKU", value: `${product?.sku || "CY-7892-X"}` },
    { label: "Category", value: `${product?.category?.name || "Electronics"}` },
    { label: "Weight", value: `${product?.weight != null ? product.weight : "0.5"} kg` },
    { 
      label: "Dimensions", 
      value: product?.dimensions 
        ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm` 
        : "Standard Dimensions" 
    },
  ];
}
