import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { translateEnum } from "@/lib/i18n";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle } from "lucide-react";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";

const PropertyDetailsSkeleton = () => {
  return (
    <div className="mb-6 animate-pulse">
      {/* Amenities Skeleton */}
      <div>
        <div className="h-7 bg-gray-200 rounded w-48 my-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center border rounded-xl py-6 px-3"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Skeleton */}
      <div className="mt-12 mb-16">
        <div className="h-7 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center border rounded-xl py-6 px-3"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Section Skeleton */}
      <div>
        <div className="h-7 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mt-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mt-1" />

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded flex-1" />
            <div className="h-10 bg-gray-200 rounded flex-1" />
            <div className="h-10 bg-gray-200 rounded flex-1" />
          </div>
          <div className="space-y-3 mt-4">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between py-2">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between py-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const { t } = useTranslations();
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <PropertyDetailsSkeleton />;
  if (isError || !property) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t("common.notFound")}
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold my-3">
          {t("property.propertyAmenities")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {property.amenities.map((amenity: AmenityEnum) => {
            const Icon = AmenityIcons[amenity as AmenityEnum] || HelpCircle;
            return (
              <div
                key={amenity}
                className="flex flex-col items-center border border-gray-200 hover:border-primary-300 rounded-xl py-6 px-3 transition-all hover:shadow-md group"
              >
                <Icon className="w-8 h-8 mb-2 text-gray-600 group-hover:text-primary-600 transition-colors" />
                <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-gray-900 font-medium">
                  {translateEnum("amenities", amenity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-12 mb-16">
        <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
          {t("property.highlights")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
          {property.highlights.map((highlight: HighlightEnum) => {
            const Icon =
              HighlightIcons[highlight as HighlightEnum] || HelpCircle;
            return (
              <div
                key={highlight}
                className="flex flex-col items-center border border-primary-200 hover:border-primary-400 rounded-xl py-6 px-3 transition-all hover:shadow-md group bg-gradient-to-b from-primary-50/50 to-transparent"
              >
                <Icon className="w-8 h-8 mb-2 text-primary-600 dark:text-primary-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-center text-primary-700 dark:text-primary-300 font-medium">
                  {translateEnum("highlights", highlight)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Section */}
      <div>
        <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-3">
          {t("property.feesAndPolicies")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-primary-300 mb-6">
          {t("property.feesDescription")}
        </p>
        <Tabs defaultValue="required-fees" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="required-fees" className="text-xs sm:text-sm">
              {t("property.requiredFees")}
            </TabsTrigger>
            <TabsTrigger value="pets" className="text-xs sm:text-sm">
              {t("property.pets")}
            </TabsTrigger>
            <TabsTrigger value="parking" className="text-xs sm:text-sm">
              {t("property.parking")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="required-fees" className="w-full mt-6">
            <div className="border rounded-lg overflow-hidden">
              <p className="font-semibold px-4 py-3 bg-gray-50 border-b text-sm sm:text-base">
                {t("property.oneTimeMoveInFees")}
              </p>
              <div className="divide-y">
                <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {t("property.applicationFee")}
                  </span>
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">
                    ${property.applicationFee}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {t("property.securityDeposit")}
                  </span>
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">
                    ${property.securityDeposit}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pets" className="mt-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">
                  {t("property.petPolicy")}:{" "}
                </span>
                {t("property.pets")}{" "}
                <span
                  className={
                    property.isPetsAllowed
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {property.isPetsAllowed
                    ? t("property.petsAllowedLower")
                    : t("property.petsNotAllowed")}
                </span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="parking" className="mt-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">
                  {t("property.parkingLabel")}:{" "}
                </span>
                {t("property.parking")}{" "}
                <span
                  className={
                    property.isParkingIncluded
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {property.isParkingIncluded
                    ? t("property.parkingIncludedLower")
                    : t("property.parkingNotIncluded")}
                </span>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetails;
