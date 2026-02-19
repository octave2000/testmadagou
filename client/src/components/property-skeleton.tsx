// components/skeletons/property-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function PropertySkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg h-full min-h-[18rem] md:min-h-[22rem]">
      {/* Image Skeleton with Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {/* Like Button Skeleton */}
        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm animate-pulse" />

        {/* Featured Badge Skeleton */}
        <div className="flex flex-col gap-2 items-end">
          <div className="h-7 w-24 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-7 w-20 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Bottom Content Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
        {/* Price Skeleton */}
        <div className="mb-3">
          <div className="h-8 w-40 bg-gray-300/80 rounded-lg animate-pulse" />
        </div>

        {/* Stats Pills Skeleton */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-8 w-16 bg-gray-300/60 rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-gray-300/60 rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-gray-300/60 rounded-lg animate-pulse" />
        </div>

        {/* Location Skeleton */}
        <div className="h-5 w-48 bg-gray-300/70 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function BentoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[18rem] md:auto-rows-[22rem]">
      {Array.from({ length: count }).map((_, i) => (
        <PropertySkeleton key={i} />
      ))}
    </div>
  );
}
