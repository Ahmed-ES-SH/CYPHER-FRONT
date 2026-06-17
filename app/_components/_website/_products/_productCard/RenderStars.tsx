import { Product } from "@/src/modules/products";
import { BiStar } from "react-icons/bi";

interface RenderStarsProps {
  product: Product;
}

export default function RenderStars({ product }: RenderStarsProps) {
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <BiStar key={i} size={12} className="fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <BiStar
          size={12}
          className="fill-yellow-400 text-yellow-400"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <BiStar key={i} size={12} className="text-gray-300" />
      ))}
      <span className="text-gray-500 text-xs mr-1">
        ({product.reviews?.length || 0})
      </span>
    </div>
  );
}
