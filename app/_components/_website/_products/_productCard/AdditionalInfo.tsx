import { ProductType } from "@/app/types/productType";

interface AdditionalInfoProps {
  product: ProductType;
  isHovered: boolean;
}

export default function AdditionalInfo({
  product,
  isHovered,
}: AdditionalInfoProps) {
  return (
    <div
      className={`transition-all ${isHovered ? "h-[100px]" : "h-0"} duration-300 overflow-hidden`}
    >
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="text-xs text-gray-600 space-y-1">
          {product.warrantyInformation && (
            <div className="flex items-center">
              <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 shrink-0"></span>
              Warranty: {product.warrantyInformation}
            </div>
          )}
          {product.returnPolicy && (
            <div className="flex items-center">
              <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 shrink-0"></span>
              Return Policy: {product.returnPolicy}
            </div>
          )}
          {product.sku && (
            <div className="flex items-center">
              <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 shrink-0"></span>
              SKU: {product.sku}
            </div>
          )}
          {product.minimumOrderQuantity > 1 && (
            <div className="flex items-center">
              <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 shrink-0"></span>
              Min Order: {product.minimumOrderQuantity} pieces
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
