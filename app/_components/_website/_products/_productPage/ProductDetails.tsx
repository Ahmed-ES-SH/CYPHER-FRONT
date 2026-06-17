import { motion } from "framer-motion";
import { FaTruck, FaShoppingCart, FaShieldAlt } from "react-icons/fa";
import { Product } from "@/src/modules/products";
import ProductRenderStars from "./ProductRenderStars";
import Quantity_Actions from "./Quantity&Actions";
import CategoriesSocial from "./Categories&social";
import QuickSpecs from "./QuickSpecs";

interface ProductDetailsProps {
  product: Product;
  discountedPrice: number;
  isWishlisted: boolean;
  setIsWishlisted: (value: boolean) => void;
  specs: { label: string; value: string }[];
}

export default function ProductDetails({
  product,
  discountedPrice,
  isWishlisted,
  setIsWishlisted,
  specs,
}: ProductDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Product Title & Brand */}
      <div className="space-y-1">
        <span className="text-primary-blue text-sm font-bold uppercase tracking-widest">
          {product.brand || "Premium Brand"}
        </span>
        <h1 className="text-4xl font-bold text-dark-btn leading-tight">
          {product.title}
        </h1>
        <p className="text-icon-color text-sm">
          SKU: <span className="font-medium">{product?.sku || "CY-7892-X"}</span> | 
          Model: <span className="font-medium">2024 Gen-3</span>
        </p>
      </div>

      {/* Rating & Stock */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <ProductRenderStars
            rating={product.rating}
            reviews={product.reviews?.length ?? 0}
          />
          <span className="text-icon-color text-sm">
            ({product.reviews.length} Reviews)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 text-sm font-bold uppercase tracking-wide">
            {product.availabilityStatus} ({product?.stock})
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="py-6 border-y border-gray-100 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase text-icon-color tracking-widest">
            Best Offer
          </p>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-bold text-dark-btn">
              ${product.price}
            </span>
            <span className="text-lg text-icon-color/50 line-through">
              ${discountedPrice?.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="bg-primary-yellow/10 border border-primary-yellow/20 px-4 py-2 rounded-full">
          <span className="text-primary-yellow font-bold text-sm">
            SAVE {(product.discountPercentage).toFixed(0)}% TODAY
          </span>
        </div>
      </div>

      {/* Quantity & Actions */}
      <Quantity_Actions
        product={product}
        setIsWishlisted={setIsWishlisted}
        isWishlisted={isWishlisted}
      />

      {/* Premium Highlights (Consolidated Alerts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <FaTruck className="text-primary-blue" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-btn">Standard Shipping</p>
            <p className="text-xs text-icon-color">Arrives within 3-5 days</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <FaShieldAlt className="text-primary-blue" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-btn">Warranty Included</p>
            <p className="text-xs text-icon-color">{product.warrantyInformation || "2-Year Manufacturer Protection"}</p>
          </div>
        </div>
      </div>

      {/* High-Urgency Subtle Notification */}
      <p className="text-sm text-icon-color flex items-center gap-2">
        <FaShoppingCart className="text-primary-yellow opacity-70" />
        <span className="italic">5 people currently have this item in their cart.</span>
      </p>

      {/* Categories & Social */}
      <CategoriesSocial tags={product.tags ?? []} />

      {/* Quick Specs */}
      <QuickSpecs specs={specs} />
    </motion.div>
  );
}
