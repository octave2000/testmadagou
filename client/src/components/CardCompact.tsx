"use client";

import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import { PropertyWithStatus } from "@/types/api";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import {
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";

const CardCompact = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: CardCompactProps) => {
  const { t, language } = useTranslations();
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg",
  );
  const currency = useAppSelector((state) => state.global.currency);
  const propertyStatus = property as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(propertyStatus);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(propertyStatus);
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale"
      ? t("header.buy")
      : t(priceUnitKey)
    : "";
  const isAvailable = propertyStatus.isAvailable ?? true;
  const featuredUntilLabel = propertyStatus.featuredUntil
    ? formatDate(propertyStatus.featuredUntil, language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const superFeaturedUntilLabel = propertyStatus.superFeaturedUntil
    ? formatDate(propertyStatus.superFeaturedUntil, language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full flex h-40 mb-5">
      <div className="relative w-1/3">
        <Image
          src={imgSrc}
          alt={property.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
          {property.isFeatured && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              {t("property.featured")}
            </span>
          )}
          {property.isSuperFeatured && (
            <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              {t("property.superFeatured")}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full w-fit border ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {isAvailable ? t("property.available") : t("property.unavailable")}
          </span>
          {property.isPetsAllowed && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full w-fit">
              {t("property.pets")}
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              {t("property.parking")}
            </span>
          )}
        </div>
      </div>
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-1">
              {propertyLink ? (
                <Link
                  href={propertyLink}
                  className="hover:underline hover:text-blue-600"
                  scroll={false}
                >
                  {property.name}
                </Link>
              ) : (
                property.name
              )}
            </h2>
            {showFavoriteButton && (
              <button
                className="bg-white rounded-full p-1"
                onClick={onFavoriteToggle}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-1 text-sm">
            {property?.location?.address}, {property?.location?.city}
          </p>
          {(featuredUntilLabel || superFeaturedUntilLabel) && (
            <div className="mb-1 text-[11px] text-gray-500 flex flex-wrap gap-2">
              {featuredUntilLabel && (
                <span>
                  {t("dashboard.featuredUntil")}: {featuredUntilLabel}
                </span>
              )}
              {superFeaturedUntilLabel && (
                <span>
                  {t("dashboard.superFeaturedUntil")}: {superFeaturedUntilLabel}
                </span>
              )}
            </div>
          )}
          <div className="flex text-sm items-center">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />
            <span className="font-semibold">
              {property.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600 ml-1">
              ({property.numberOfReviews})
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-2 text-gray-600">
            <span className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {property.beds}
            </span>
            <span className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {property.baths}
            </span>
            <span className="flex items-center">
              <House className="w-4 h-4 mr-1" />
              {property.squareFeet}
            </span>
          </div>

          <p className="text-base font-bold">
            {priceLabel}
            <span className="text-gray-600 text-xs font-normal">
              {priceUnitLabel}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardCompact;
