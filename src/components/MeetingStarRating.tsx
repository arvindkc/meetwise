import { StarFilledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface MeetingStarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
}

export function MeetingStarRating({ rating, onRate }: MeetingStarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={cn(
            "p-1 hover:text-yellow-400 transition-colors",
            rating >= star ? "text-yellow-400" : "text-gray-300"
          )}
        >
          <StarFilledIcon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}
