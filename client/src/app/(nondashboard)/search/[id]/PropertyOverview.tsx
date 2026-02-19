"use client";

import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertyQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { MapPin, Star, BadgeCheck, Heart, Mail, Phone, UserRound } from "lucide-react";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";
import { PropertyWithStatus } from "@/types/api";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { Property } from "@/types/prismaTypes";
import { formatDate } from "@/lib/date";
import {
  getPriceCategoryTranslationKey,
  getPriceUnitTranslationKey,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";

const PropertyOverviewSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-48 sm:w-64 mb-2" />
        <div className="h-8 sm:h-10 bg-gray-200 rounded w-5/6 my-4" />

        {/* Desktop layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>
          <div className="flex gap-3 justify-between">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Details - Desktop */}
      <div className="hidden sm:block border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="border-l border-gray-300 h-10" />}
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-16" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details - Mobile */}
      <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="my-12 sm:my-16">
        <div className="h-6 sm:h-7 bg-gray-200 rounded w-48 sm:w-64 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded"
              style={{ width: i === 2 ? "92%" : i === 4 ? "85%" : "100%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const { t, language } = useTranslations();
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const isTenantUser = authUser?.userRole === "tenant";
  const { data: tenant } = useGetTenantQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId || !isTenantUser,
  });
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);
  const propertyStatus = property as PropertyWithStatus | undefined;
  const isAvailable = propertyStatus?.isAvailable ?? true;
  const featuredUntilLabel = propertyStatus?.featuredUntil
    ? formatDate(propertyStatus.featuredUntil, language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const superFeaturedUntilLabel = propertyStatus?.superFeaturedUntil
    ? formatDate(propertyStatus.superFeaturedUntil, language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const currency = useAppSelector((state) => state.global.currency);
  const priceAmount = propertyStatus ? getPrimaryPriceAmount(propertyStatus) : 0;
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = propertyStatus
    ? getPriceUnitTranslationKey(propertyStatus)
    : null;
  const priceCategoryKey = propertyStatus
    ? getPriceCategoryTranslationKey(propertyStatus)
    : "property.monthlyRent";
  const priceCategoryLabel =
    priceCategoryKey === "property.forSale"
      ? t("header.buy")
      : t(priceCategoryKey);
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale"
      ? t("header.buy")
      : t(priceUnitKey)
    : "";
  const canToggleFavorite = !authUser || isTenantUser;
  const isFavorite =
    tenant?.favorites?.some((fav: Property) => fav.id === propertyId) || false;

  const handleFavoriteToggle = async () => {
    if (!authUser) {
      router.push("/signin");
      return;
    }

    if (!isTenantUser) return;

    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
      return;
    }

    await addFavorite({
      cognitoId: authUser.cognitoInfo.userId,
      propertyId,
    });
  };

  if (isLoading) return <PropertyOverviewSkeleton />;
  if (isError || !property) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t("common.notFound")}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-2">
          {property.location?.country} / {property.location?.state} /{" "}
          <span className="font-semibold text-gray-700">
            {property.location?.city}
          </span>
        </div>

        {/* Title */}
        <div className="my-4 flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {property.name}
          </h1>
          {canToggleFavorite && (
            <button
              type="button"
              className="bg-white border border-gray-200 hover:bg-gray-50 rounded-full p-2 transition-colors shrink-0"
              onClick={handleFavoriteToggle}
              aria-label={t("dashboard.favorites")}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>

        {/* Location and Rating - Desktop */}
        <div className="hidden sm:flex justify-between items-center flex-wrap gap-4">
          <span className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-700 flex-shrink-0" />
            {property.location?.city}, {property.location?.state},{" "}
            {property.location?.country}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center text-yellow-500 text-sm font-medium">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
              {property.numberOfReviews === 1
                ? t("property.review")
                : t("property.reviews")}
            </span>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <BadgeCheck className="w-4 h-4 mr-1" />
              {t("property.verified")}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isAvailable
                ? t("property.available")
                : t("property.unavailable")}
            </span>
            {property.isFeatured && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {t("property.featured")}
              </span>
            )}
            {property.isSuperFeatured && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {t("property.superFeatured")}
              </span>
            )}
          </div>
        </div>

        {(featuredUntilLabel || superFeaturedUntilLabel) && (
          <div className="hidden sm:flex mt-3 gap-3 text-xs text-gray-500">
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

        {/* Location and Rating - Mobile */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-700 flex-shrink-0" />
            <span className="truncate">
              {property.location?.city}, {property.location?.state}
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <span className="flex items-center text-yellow-500 text-sm font-medium">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {property.averageRating.toFixed(1)} ({property.numberOfReviews})
            </span>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <BadgeCheck className="w-4 h-4 mr-1" />
              {t("property.verified")}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                isAvailable
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isAvailable
                ? t("property.available")
                : t("property.unavailable")}
            </span>
            {property.isFeatured && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {t("property.featured")}
              </span>
            )}
            {property.isSuperFeatured && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {t("property.superFeatured")}
              </span>
            )}
          </div>
          {(featuredUntilLabel || superFeaturedUntilLabel) && (
            <div className="flex flex-col gap-1 text-xs text-gray-500">
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
        </div>
      </div>

      {/* Details - Desktop */}
      <div className="hidden sm:block border border-gray-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-1">{priceCategoryLabel}</div>
            <div className="text-xl font-bold text-gray-900">
              {priceLabel}
              {priceUnitKey && (
                <span className="text-sm font-normal text-gray-500">
                  {priceUnitLabel}
                </span>
              )}
            </div>
          </div>
          <div className="border-l border-gray-300 h-12" />
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {t("property.bedrooms")}
            </div>
            <div className="text-xl font-bold text-gray-900">
              {property.beds}
            </div>
          </div>
          <div className="border-l border-gray-300 h-12" />
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {t("property.bathrooms")}
            </div>
            <div className="text-xl font-bold text-gray-900">
              {property.baths}
            </div>
          </div>
          <div className="border-l border-gray-300 h-12" />
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {t("filters.squareFeet")}
            </div>
            <div className="text-xl font-bold text-gray-900">
              {property.squareFeet.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Details - Mobile (Grid) */}
      <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-xs text-gray-500 mb-1">{priceCategoryLabel}</div>
          <div className="text-lg font-bold text-gray-900">
            {priceLabel}
            {priceUnitKey && (
              <span className="text-xs font-normal text-gray-500">
                {priceUnitLabel}
              </span>
            )}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-xs text-gray-500 mb-1">
            {t("property.bedrooms")}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {property.beds} {t("property.bedShort")}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-xs text-gray-500 mb-1">
            {t("property.bathrooms")}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {property.baths} {t("property.bathShort")}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-xs text-gray-500 mb-1">
            {t("filters.squareFeet")}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {property.squareFeet.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="my-12 sm:my-16">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
          {t("property.about")} {property.name}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {property.description}
        </p>
      </div>

      <div className="mb-12 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
          {t("contact.managerContact")}
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <UserRound className="w-4 h-4 text-gray-500" />
            <span>
              {t("contact.managerName")}:{" "}
              {property.manager?.name || t("contact.notAvailable")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            {property.manager?.email ? (
              <a
                href={`mailto:${property.manager.email}`}
                className="hover:underline"
              >
                {t("contact.managerEmail")}: {property.manager.email}
              </a>
            ) : (
              <span>
                {t("contact.managerEmail")}: {t("contact.notAvailable")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            {property.manager?.phoneNumber ? (
              <a
                href={`tel:${property.manager.phoneNumber}`}
                className="hover:underline"
              >
                {t("contact.managerPhone")}: {property.manager.phoneNumber}
              </a>
            ) : (
              <span>
                {t("contact.managerPhone")}: {t("contact.notAvailable")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
