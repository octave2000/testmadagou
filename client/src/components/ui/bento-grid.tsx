"use client";

import { cn } from "@/lib/utils";
import {
  Bath,
  Bed,
  Maximize,
  Heart,
  MapPin,
  Star,
  ArrowRight,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import {
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";
import { PropertyWithStatus } from "@/types/api";
import { t as translate } from "@/lib/i18n";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5  auto-rows-[24rem] md:auto-rows-[30rem]  gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  listing,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = false,
}: {
  className?: string;
  listing?: any;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  showFavoriteButton?: boolean;
}) => {
  const currency = useAppSelector((state) => state.global.currency);
  const listingProperty = listing as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(listingProperty);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(listingProperty);
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale"
      ? translate("header.buy")
      : translate(priceUnitKey)
    : "";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group/bento relative rounded-md overflow-hidden bg-white transition-all duration-500 hover:-translate-y-2 flex flex-col",
        className,
      )}
    >
      <Link href={`/search/${listing.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full h-52 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-lg">
          {/* Skeleton Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Main Image */}
          <Image
            width={1920}
            height={1080}
            src={listing.photoUrls[0] || "/2.jpg"}
            alt={listing.name || listing.location?.address || "Property"}
            className={cn(
              "w-full h-full  rounded-lg object-cover transition-all duration-700 ease-out",

              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 group-hover/bento:opacity-80 transition-opacity duration-500" />

          {/* Featured Badge & Property Type - Stay on Image */}
          <div className="absolute top-2  right-2 md:top-4 md:right-4 flex flex-col gap-2 z-10">
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 ">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
            {listing.propertyType && (
              <span className=" hidden md:flex px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full shadow-lg  items-center gap-1">
                <Home className="w-3 h-3" />
                {listing.propertyType}
              </span>
            )}
          </div>

          {/* Like Button */}
          {showFavoriteButton && (
            <button
              type="button"
              className="absolute top-2 left-2 md:top-4 md:left-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFavoriteToggle?.();
              }}
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}

          {/* Shine Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/bento:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* Content Below Image */}
        <div className="flex-1 p-2 space-y-1">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <h4 className="text-xl font-bold text-gray-900">
              {priceLabel}
            </h4>
            {priceUnitKey ? (
              <span className="text-sm font-medium text-gray-600">
                {priceUnitLabel}
              </span>
            ) : null}
          </div>

          {/* Property Name */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover/bento:text-blue-600 transition-colors">
            {listing.name || "Luxury Property"}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium line-clamp-1">
              {listing.location?.city}, {listing.location?.state}
            </p>
          </div>

          {/* Property Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {listing.beds} beds
              </span>
            </div>

            <span className="hidden sm:inline text-gray-300">•</span>

            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {listing.baths} baths
              </span>
            </div>

            <span className="hidden sm:inline text-gray-300">•</span>

            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {listing.squareFeet} sqft
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
