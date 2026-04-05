"use client";
import { useWishlistStore } from "@/app/store/WishlistStoreStore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import Img from "../../_global/Img";
import { LuHeartCrack } from "react-icons/lu";
import { useCartStore } from "@/app/store/CartStore";
import { ProductType } from "@/app/types/productType";

export default function WishListProducts() {
  const { wishlistItems, removeFromWishlist, clearWishlist } =
    useWishlistStore();
  const { addToCart } = useCartStore();

  const [showWishList, setShowWishList] = useState(false);

  const WrapperAddToCart = (product: ProductType) => {
    const isInWishList = wishlistItems.some((item) => item.id === product.id);
    if (isInWishList) {
      removeFromWishlist(product.id);
      addToCart(product);
    }
  };
  return (
    <>
      <div
        id="favoriteList"
        className="relative cursor-pointer "
        onClick={() => setShowWishList(!showWishList)}
      >
        <AiOutlineHeart
          className={`${showWishList ? "text-red-500" : "text-icon-color"} size-7 hover:text-red-500 duration-300`}
        />
        {wishlistItems.length > 0 && (
          <div className="min-w-fit w-4 h-4 absolute -top-1 -right-2 animate-bounce bg-red-400 text-white flex items-center justify-center text-[10px] font-bold rounded-full p-1">
            {wishlistItems.length}
          </div>
        )}

        {/* Mini WhishList */}
        <AnimatePresence>
          {showWishList && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1.02 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute min-h-80 right-0 max-md:-right-10  mt-4 w-[340px] bg-white shadow-2xl rounded-xl p-4 space-y-3 z-99999"
            >
              <h4 className="text-lg pb-2 border-b border-gray-200 font-semibold text-gray-800">
                WishList Items
              </h4>

              <div className="h-full">
                {wishlistItems.length === 0 ? (
                  <div className="h-60 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <LuHeartCrack className="size-12 text-icon-color" />
                      <p className="text-sm text-gray-500">
                        Your WhistList is Empty.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto hidden-scrollbar space-y-3  pr-1">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 relative not-last:border-b border-gray-200 pb-2"
                      >
                        <Img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.title.length > 10
                              ? item.title.slice(0, 10) + "..."
                              : item.title}
                          </p>
                          <p className="text-xs text-gray-500">${item.price}</p>
                        </div>
                        <div className="">
                          <div
                            onClick={() => removeFromWishlist(item.id)}
                            className="group w-4 h-4 ml-auto cursor-pointer  rounded-full  bg-red-400 hover:bg-red-600 hover:scale-110 duration-300 flex items-center justify-center"
                          >
                            <FaTimes className="size-3  text-white group-hover:text-white duration-300" />
                          </div>
                          <button
                            onClick={() => WrapperAddToCart(item)}
                            className="text-[12px] whitespace-nowrap px-6 py-1 mt-1 rounded-md text-white bg-primary hover:bg-primary/70 duration-500"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total & Actions */}
              <div className="border-t bg-white border-gray-200 absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <div className="flex flex-col items-center w-full  gap-2">
                  <button
                    onClick={clearWishlist}
                    className="flex-1 w-full py-2 text-sm font-medium bg-red-300 hover:bg-red-500 text-white rounded-lg transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
