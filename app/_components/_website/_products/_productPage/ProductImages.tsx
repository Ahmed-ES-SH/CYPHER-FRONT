"use client";
import { motion, AnimatePresence } from "framer-motion";
import Img from "@/app/_components/_global/Img";
import { Product } from "@/src/modules/products";

interface ProductImagesProps {
  images: Product["images"];
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  discountPercentage: number;
}

export default function ProductImages({
  images,
  selectedImage,
  setSelectedImage,
  discountPercentage,
}: ProductImagesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      {/* Discount Badge */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10"
        >
          -{discountPercentage}%
        </motion.div>

        {/* Main Image */}
        <div className="bg-white rounded-2xl shadow-lg p-8 h-[500px] flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1] // Standard Material easing or similar
              }}
              className="w-full h-full flex items-center justify-center p-4 content-contain"
            >
              <Img
                src={
                  selectedImage && selectedImage.trim() !== ""
                    ? selectedImage
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={`product-img`}
                className="w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-3 ">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`shrink-0 w-20 h-20 bg-white rounded-lg p-2 border border-gray-200 hover:scale-110 duration-300 transition-all`}
          >
            <Img
              src={
                image && image.trim() !== ""
                  ? image
                  : "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={`iPad ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
