"use client";

import { useEffect, useState } from "react";
import { Product } from "@/src/modules/products";
import { useWishlistStore } from "@/app/store/WishlistStoreStore";
import { returnSpecs } from "./_productPage/constants";

import Breadcrumb from "@/app/_components/_global/Breadcrumb";
import ErrorMessage from "@/app/_components/_global/ErrorMessage";
import ProductImages from "./_productPage/ProductImages";
import SliderOfRecommendedProducts from "./SliderOfRecommendedProducts";
import ProductDetailsTabs from "./_productPage/ProductDetailsTabs";
import ProductDetails from "./_productPage/ProductDetails";

interface ProductPageProps {
  product: Product;
}

export default function ProductPage({ product }: ProductPageProps) {
  const { wishlistItems } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState<string>("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState(false);

  const specs = returnSpecs(product!);

  // Calculate discounted price
  const discountedPrice =
    product && product.price * (1 - Number(product.discountPercentage) / 100);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || "");
    } else {
      setError(true);
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (product) {
      const isInWishlist = wishlistItems.find((item) => item.id == product.id);
      if (isInWishlist) {
        setIsWishlisted(true);
      }
    }
  }, [product, wishlistItems]);

  if (!product)
    return (
      <ErrorMessage
        isOpen={error}
        onClose={() => setError(false)}
        Message="This Product Not Available Or Something is Wrong"
      />
    );

  return (
    <>
      <div className="min-h-screen c-container bg-gray-50 my-4">
        {/* Breadcrumb */}
        <Breadcrumb />

        <div className="w-full mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <ProductImages
              images={product.images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              discountPercentage={Number(product.discountPercentage)}
            />

            {/* Product Details */}
            <ProductDetails
              product={product}
              discountedPrice={discountedPrice!}
              isWishlisted={isWishlisted}
              setIsWishlisted={setIsWishlisted}
              specs={specs}
            />
          </div>

          {/* Product Details Tabs */}
          <ProductDetailsTabs product={product} specs={specs} />
        </div>

        {/* Slider Of Recommended Products */}
        <SliderOfRecommendedProducts />
      </div>
    </>
  );
}
