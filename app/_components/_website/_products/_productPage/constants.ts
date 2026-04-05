import { ProductType } from "@/app/types/productType";

export const keyFeatures = [
  "Slim body with metal cover",
  "Latest Intel Core i5-1135G7 processor (4 cores / 8 threads)",
  "8GB DDR4 RAM and fast 512GB PCIe SSD",
  "NVIDIA GeForce MX350 2GB GDDR5 graphics card",
  "Backlit keyboard, touchpad with gesture support",
];

export function returnSpecs(product: ProductType) {
  return [
    { label: "Screen Size", value: "10.9 in" },
    { label: "Operating System", value: "Apple iOS" },
    { label: "Brand", value: `${product?.brand}` },
  ];
}
