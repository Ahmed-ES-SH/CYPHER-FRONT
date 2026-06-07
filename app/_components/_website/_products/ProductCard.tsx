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
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: props) {
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
        text: `Only ${product.stock} left`,
        color: "text-red-500",
      };
    if (product.stock <= 10)
      return {
        text: `${product.stock} left`,
        color: "text-amber-600",
      };
    return { text: "In Stock", color: "text-green-600" };
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
      className={`relative bg-surface-elevated rounded-md cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg group w-full h-fit border border-border-subtle ${
        viewMode === "list" ? "flex flex-row" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* TOP PRODUCT badge */}
      {isTopProduct && (
        <div className="absolute top-3 left-3 bg-primary-blue text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm z-10 tracking-wide">
          TOP RATED
        </div>
      )}

      {/* Discount badge */}
      {product.discountPercentage > 0 && (
        <div
          className="absolute top-3 left-3 bg-primary-yellow text-dark-btn text-[11px] font-semibold px-2.5 py-1 rounded-sm z-10 tracking-wide"
          style={{ top: isTopProduct ? "2.25rem" : "0.75rem" }}
        >
          -{Math.round(product.discountPercentage)}%
        </div>
      )}

      {/* Product image */}
      <div
        className={`relative overflow-hidden bg-surface border-gray-200 ${
          viewMode === "list"
            ? "w-48 shrink-0 border-r aspect-square self-start"
            : "border-b aspect-square"
        }`}
      >
        <Img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={product.title}
          className={`w-full h-full object-contain p-4 transition-transform duration-300 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* Side icons - always visible on mobile, hover-reveal on desktop */}
        <div className="absolute right-3 top-16 transform -translate-y-1/2 flex flex-col items-center gap-2">
          {/* Heart icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isInWishList
                ? removeFromWishlist(product.id)
                : addToWishlist(product);
            }}
            aria-label={
              isInWishList ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`z-10 p-2 rounded-full shadow-md transition-colors duration-200 xl:opacity-0 xl:translate-x-8 xl:group-hover:opacity-100 xl:group-hover:translate-x-0 opacity-100 translate-x-0 ${
              isInWishList
                ? "bg-primary-yellow hover:bg-yellow-400 text-dark-btn"
                : "hover:bg-surface bg-surface-elevated text-text-muted"
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
            aria-label="Quick view product"
            className={`p-2 block bg-surface-elevated rounded-full shadow-md hover:bg-surface transition-all duration-300 xl:opacity-0 xl:translate-x-8 xl:group-hover:opacity-100 xl:group-hover:translate-x-0 opacity-100 translate-x-0`}
          >
            <BsEye size={16} className="text-text-secondary" />
          </Link>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 flex-1">
        {/* Brand */}
        {product.brand && (
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1 font-medium">
            {product.brand}
          </div>
        )}

        {/* Product title */}
        <Link
          href={`/products/${formatTitle(product.title)}?productId=${
            product.id
          }`}
          className={`text-text-primary font-medium text-[14px] mb-2 hover:text-primary-blue transition-colors duration-200 block leading-tight ${
            viewMode === "list" ? "" : "line-clamp-2 min-h-[40px]"
          }`}
        >
          {product.title}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <RenderStars product={product} />
        </div>

        {/* Prices */}
        <div className="flex items-center gap-2 mb-3">
          {product.discountPercentage > 0 && (
            <span className="text-text-muted text-sm line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
          <span className="text-primary-blue font-bold text-lg">
            $
            {product.discountPercentage > 0
              ? discountedPrice.toFixed(2)
              : product.price.toFixed(2)}
          </span>
        </div>

        {/* Stock status */}
        <div className={`text-xs mb-3 ${stockStatus.color}`}>
          {stockStatus.text}
        </div>

        {/* Additional info on hover */}
        <AdditionalInfo isHovered={isHovered} />

        {/* Add to cart button */}
        <ProductAction product={product} isHovered={isHovered} />
      </div>
    </div>
  );
}
