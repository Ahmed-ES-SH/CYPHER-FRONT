"use client";
import { BsEye } from "react-icons/bs";
import { BiHeart } from "react-icons/bi";
import { useState } from "react";
import { ProductType } from "@/app/types/productType";
import { formatTitle } from "@/app/helpers/helpers";
import { useWishlistStore } from "@/app/store/WishlistStoreStore";
import { IoHeartDislikeOutline } from "react-icons/io5";

import Img from "../../_global/Img";
import Link from "next/link";
import RenderStars from "./_productCard/RenderStars";
import AdditionalInfo from "./_productCard/AdditionalInfo";
import ProductAction from "./_productCard/ProductAction";

interface props {
  product: ProductType;
}

export default function ProductCard({ product }: props) {
  const { addToWishlist, wishlistItems, removeFromWishlist } =
    useWishlistStore();

  const [isHovered, setIsHovered] = useState(false);

  const isInWishList =
    !!product && wishlistItems.some((item) => item.id === product.id);

  // Calculate discounted price
  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);

  // Determine if product is top rated (rating above 4.5)
  const isTopProduct = product.rating >= 4.5;

  // Determine stock status
  const getStockStatus = () => {
    if (product.stock === 0)
      return { text: "Out of Stock", color: "text-red-600" };
    if (product.stock <= 5)
      return {
        text: `Only ${product.stock} left in stock`,
        color: "text-red-500",
      };
    if (product.stock <= 10)
      return {
        text: `${product.stock} left in stock`,
        color: "text-orange-500",
      };
    return { text: "In Stock", color: "text-green-500" };
  };

  const stockStatus = getStockStatus();

  // on mouse leave
  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  return (
    <div
      className="relative bg-white rounded-lg cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl group w-full hover:scale-110 h-fit  z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* TOP PRODUCT badge */}
      {isTopProduct && (
        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          TOP PRODUCT
        </div>
      )}

      {/* Discount badge */}
      {product.discountPercentage > 0 && (
        <div
          className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10"
          style={{ top: isTopProduct ? "2.5rem" : "0.75rem" }}
        >
          -{Math.round(product.discountPercentage)}%
        </div>
      )}

      {/* Product image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={product.title}
          className={`w-full h-1/2 object-cover transition-transform duration-300 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* Side icons on hover */}
        <div
          className={`absolute right-3 top-16 transform -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-300 `}
        >
          {/* Heart icon */}
          <button
            onClick={
              isInWishList
                ? () => removeFromWishlist(product.id)
                : () => addToWishlist(product)
            }
            className={`z-10 p-2  rounded-full shadow-md  transition-colors duration-200 ${
              isInWishList
                ? "bg-red-300 hover:bg-red-400 text-white"
                : "hover:bg-gray-100 bg-white text-gray-400"
            }`}
          >
            {isInWishList ? (
              <IoHeartDislikeOutline size={18} />
            ) : (
              <BiHeart size={18} />
            )}
          </button>
          <Link
            href={`/products/${formatTitle(product.title)}?productId=${
              product.id
            }`}
            className={`p-2 block bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <BsEye size={16} className="text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </div>
        )}

        {/* Product title */}
        <Link
          href={`/products/${formatTitle(product.title)}?productId=${
            product.id
          }`}
          className="text-blue-600 font-medium hover:underline text-sm mb-2 line-clamp-2 hover:text-blue-800 transition-colors duration-200 min-h-[50px]"
        >
          {product.title}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <RenderStars product={product} />
          <div className="text-xs text-gray-500 mt-1">
            {product.rating.toFixed(1)} out of 5
          </div>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-2 mb-3">
          {product.discountPercentage > 0 && (
            <span className="text-gray-400 text-sm line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
          <span className="text-red-500 font-bold text-lg">
            $
            {product.discountPercentage > 0
              ? discountedPrice.toFixed(2)
              : product.price.toFixed(2)}
          </span>
        </div>

        {/* Shipping information */}
        <div className="text-gray-500 text-xs mb-2">
          {product.shippingInformation || "Shipping info not available"}
        </div>

        {/* Stock status */}
        <div className={`text-xs mb-3 ${stockStatus.color}`}>
          {stockStatus.text}
        </div>

        {/* Category and tags */}
        <div className="mb-3 min-h-[40px]">
          <div className="flex flex-wrap gap-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
            {product.tags?.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Additional info on hover */}
        <AdditionalInfo product={product} isHovered={isHovered} />

        {/* Add to cart button */}
        <ProductAction product={product} isHovered={isHovered} />
      </div>
    </div>
  );
}
