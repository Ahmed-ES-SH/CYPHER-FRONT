import { motion } from "framer-motion";
import { FaTruck } from "react-icons/fa";
import { ProductType } from "@/app/types/productType";
import ProductRenderStars from "./ProductRenderStars";
import Quantity_Actions from "./Quantity&Actions";
import CategoriesSocial from "./Categories&social";
import QuickSpecs from "./QuickSpecs";

interface ProductDetailsProps {
  product: ProductType;
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
      className="space-y-6"
    >
      {/* Product Title & Model */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.title}
        </h1>
        <p className="text-gray-600">
          Model: <span className="font-medium">MYFL2LLA</span> | SKU:{" "}
          <span className="font-medium">{product?.sku}</span>
        </p>
      </div>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-2"
      >
        <ProductRenderStars
          rating={product.rating}
          reviews={product.reviews?.length ?? 0}
        />

        <h5 className="text-gray-600">
          {product.reviews.length} <span className="font-light">Review</span>
        </h5>
      </motion.div>

      {/* Stock Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center space-x-2"
      >
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-green-600 font-medium">
          {product.availabilityStatus} ({product?.stock})
        </span>
      </motion.div>

      {/* Price */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-red-600">
            ${product.price}
          </span>
          <span className="text-xl text-gray-400 line-through">
            ${discountedPrice?.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {/* Quantity & Actions */}
      <Quantity_Actions
        product={product}
        setIsWishlisted={setIsWishlisted}
        isWishlisted={isWishlisted}
      />

      {/* Delivery Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3">
          <FaTruck className="text-blue-600 text-xl" />
          <div>
            <p className="font-semibold text-blue-800">2-day Delivery</p>
            <p className="text-sm text-blue-600">
              Speedy and reliable parcel delivery!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Popular Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <p className="text-yellow-800">
            <span className="font-semibold">Other people want this.</span> 5
            people have this in their carts right now.
          </p>
        </div>
      </motion.div>

      {/* Categories & Social */}
      <CategoriesSocial tags={product.tags ?? []} />

      {/* Quick Specs */}
      <QuickSpecs specs={specs} />
    </motion.div>
  );
}
