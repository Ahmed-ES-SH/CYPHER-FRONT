import { BiStar } from "react-icons/bi";

interface renderStarsProps {
  rating: number;
  reviews: number;
}

export default function ProductRenderStars({
  rating,
  reviews,
}: renderStarsProps) {
  if (!rating) return;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <BiStar
          key={i}
          size={12}
          className="fill-yellow-400 text-yellow-400 size-6"
        />
      ))}
      {hasHalfStar && (
        <BiStar
          size={12}
          className="fill-yellow-400 text-yellow-400 size-6"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <BiStar key={i} size={12} className="text-gray-300" />
      ))}
      <span className="text-gray-500 text-xs mr-1">({reviews || 0})</span>
    </div>
  );
}
