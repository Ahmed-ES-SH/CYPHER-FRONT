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
      className={`transition-all xl:${isHovered ? "h-[90px] opacity-100" : "h-0 opacity-0"} h-[90px] opacity-100 duration-200 overflow-hidden`}
    >
      <div className="border-t border-border-subtle pt-2.5 mt-2.5">
        <div className="text-xs text-text-secondary space-y-1">
          {product.warrantyInformation && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
              Warranty: {product.warrantyInformation}
            </div>
          )}
          {product.returnPolicy && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
              Returns: {product.returnPolicy}
            </div>
          )}
          {product.shippingInformation && (
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2 shrink-0"></span>
              Shipping: {product.shippingInformation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
