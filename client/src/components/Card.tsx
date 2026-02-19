"use client";

import { Bath, Bed, Heart, House, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ReasonDialog } from "./declineReason";
import { usePathname } from "next/navigation";
import { useApprovePropertyMutation } from "@/state/api";
import { DeclineDialog } from "./declineProperty";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslations } from "@/lib/i18n-client";
import PropertyStatusModal from "./PropertyStatusModal";
import { PropertyWithStatus } from "@/types/api";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import {
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
  showEditButton = false,
  onEdit,
  showDeleteButton = false,
  onDelete,
}: CardProps) => {
  const { t, language } = useTranslations();
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg",
  );
  const currency = useAppSelector((state) => state.global.currency);

  const [approveProperty] = useApprovePropertyMutation();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleApprove = async () => {
    await approveProperty({ id: property.id });
  };

  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isManager = pathname.includes("/managers");
  const propertyStatus = property as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(propertyStatus);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(propertyStatus);
  const isCustomerView = !isAdmin && !isManager;
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale" && isCustomerView
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
  const canManageStatus = isAdmin || isManager;
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full mb-5">
      <div className="relative">
        <div className="w-full h-64 relative">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          {isManager ? (
            <div className="absolute top-1 right-1">
              {property.isApproved === "Approved" ? (
                <span className="bg-green-500 px-2 py-0.5 rounded-md text-white">
                  {t("property.approved")}
                </span>
              ) : property.isApproved === "Pending" ? (
                <span className="bg-blue-500 px-2 py-0.5 rounded-md text-white">
                  {t("property.pending")}
                </span>
              ) : (
                <ReasonDialog reason={property.deniedReason} />
              )}
              <div className="mt-2 flex flex-col items-end gap-2">
                <div className="flex flex-wrap justify-end gap-2">
                  {property.isFeatured && (
                    <span className="bg-black/60 px-2 py-0.5 rounded-md text-xs text-white">
                      {t("property.featured")}
                    </span>
                  )}
                  {property.isSuperFeatured && (
                    <span className="bg-black/60 px-2 py-0.5 rounded-md text-xs text-white">
                      {t("property.superFeatured")}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs text-white ${
                    isAvailable ? "bg-emerald-600" : "bg-slate-600"
                  }`}
                >
                  {isAvailable
                    ? t("dashboard.available")
                    : t("dashboard.unavailable")}
                </span>
                <Button
                  className="h-7 px-2 text-xs bg-white/90 text-gray-700 border border-gray-200 hover:bg-white"
                  onClick={() => setIsStatusModalOpen(true)}
                  variant="outline"
                >
                  {t("dashboard.manageStatus")}
                </Button>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="absolute top-1 right-1 flex flex-col items-end gap-2">
              {property.isApproved === "Approved" && (
                <span className="bg-green-500 px-2 py-0.5 rounded-md text-white">
                  {t("property.approved")}
                </span>
              )}

              {property.isApproved === "Pending" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-yellow-500 px-2 py-0.5 rounded-md text-white">
                      {t("property.pending")}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuLabel>{t("common.state")}</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                      <Button
                        className="bg-blue-500 inline-block hover:bg-blue-500 cursor-pointer w-full text-white"
                        onClick={handleApprove}
                      >
                        {t("dashboard.approve")}
                      </Button>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <DeclineDialog propertyId={property.id} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {property.isApproved === "Denied" && (
                <span className="bg-red-500 px-2 py-0.5 rounded-md text-white">
                  {t("property.declined")}
                </span>
              )}
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  {property.isFeatured && (
                    <span className="bg-black/60 px-2 py-0.5 rounded-md text-xs text-white">
                      {t("property.featured")}
                    </span>
                  )}
                  {property.isSuperFeatured && (
                    <span className="bg-black/60 px-2 py-0.5 rounded-md text-xs text-white">
                      {t("property.superFeatured")}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs text-white ${
                      isAvailable
                        ? "bg-emerald-600"
                        : "bg-slate-600"
                    }`}
                  >
                    {isAvailable
                      ? t("dashboard.available")
                      : t("dashboard.unavailable")}
                  </span>
                </div>
                <Button
                  className="h-7 px-2 text-xs bg-white/90 text-gray-700 border border-gray-200 hover:bg-white"
                  onClick={() => setIsStatusModalOpen(true)}
                  variant="outline"
                >
                  {t("dashboard.manageStatus")}
                </Button>
              </div>
            </div>
          ) : (
            ""
          )}
          {isCustomerView && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {property.isFeatured && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                  {t("property.featured")}
                </span>
              )}
              {property.isSuperFeatured && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  {t("property.superFeatured")}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                  isAvailable
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {isAvailable
                  ? t("property.available")
                  : t("property.unavailable")}
              </span>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.isPetsAllowed && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              {t("property.petsAllowed")}
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              {t("property.parkingIncluded")}
            </span>
          )}
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          {showEditButton && onEdit && (
            <button
              className="bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer text-gray-600"
              onClick={(e) => {
                e.preventDefault();
                onEdit(property);
              }}
              aria-label={t("common.edit")}
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          {showDeleteButton && onDelete && (
            <button
              className="bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer text-red-600"
              onClick={(e) => {
                e.preventDefault();
                onDelete(property);
              }}
              aria-label={t("dashboard.deleteProperty")}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {showFavoriteButton && (
            <button
              className="bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer"
              onClick={onFavoriteToggle}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
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
        <p className="text-gray-600 mb-2">
          {property?.location?.address}, {property?.location?.city}
        </p>
        {(property.isFeatured ||
          property.isSuperFeatured ||
          featuredUntilLabel ||
          superFeaturedUntilLabel) && (
          <div className="flex flex-wrap gap-2 mb-2">
            {property.isFeatured && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {t("property.featured")}
              </span>
            )}
            {featuredUntilLabel && (
              <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] text-amber-700">
                {t("dashboard.featuredUntil")}: {featuredUntilLabel}
              </span>
            )}
            {property.isSuperFeatured && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                {t("property.superFeatured")}
              </span>
            )}
            {superFeaturedUntilLabel && (
              <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[11px] text-blue-700">
                {t("dashboard.superFeaturedUntil")}: {superFeaturedUntilLabel}
              </span>
            )}
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="font-semibold">
              {property.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600 ml-1">
              ({property.numberOfReviews} {t("property.reviews")})
            </span>
          </div>
          <p className="text-lg font-bold mb-3">
            {priceLabel}{" "}
            <span className="text-gray-600 text-base font-normal">
              {priceUnitLabel}
            </span>
          </p>
        </div>
        <hr />
        <div className="flex justify-between items-center gap-4 text-gray-600 mt-5">
          <span className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            {property.beds} {t("property.bed")}
          </span>
          <span className="flex items-center">
            <Bath className="w-5 h-5 mr-2" />
            {property.baths} {t("property.bath")}
          </span>
          <span className="flex items-center">
            <House className="w-5 h-5 mr-2" />
            {property.squareFeet} {t("property.sqFt")}
          </span>
        </div>
      </div>
      {canManageStatus && (
        <PropertyStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          property={propertyStatus}
          canEditFeatures={isAdmin}
        />
      )}
    </div>
  );
};

export default Card;
