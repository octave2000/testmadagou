"use client";

import Card from "@/components/Card";
import EditPropertyModal from "@/components/EditPropertyModal";
import Headers from "@/components/Header1";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { useGetPropertiesQuery } from "@/state/api";
import {
  DEFAULT_PROPERTY_PAGE_SIZE,
  PropertyTypeEnum,
} from "@/lib/constants";
import { inferListingLabel } from "@/lib/property-pricing";
import { translateEnum } from "@/lib/i18n";
import { PropertyWithStatus } from "@/types/api";
import { Property } from "@/types/prismaTypes";
import React, { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import Pagination from "@/components/ui/pagination";

const Properties = () => {
  const { t } = useTranslations();
  const listingOptions = ["Monthly", "Sell", "Night"] as const;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<
    "any" | "Pending" | "Approved" | "Denied"
  >("any");
  const [listingFilter, setListingFilter] = useState<
    "any" | "Monthly" | "Night" | "Sell"
  >("any");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<
    "any" | PropertyTypeEnum
  >("any");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "any" | "available" | "unavailable"
  >("any");
  const [featureFilter, setFeatureFilter] = useState<
    "any" | "featured" | "superFeatured"
  >("any");

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    approvalFilter,
    listingFilter,
    propertyTypeFilter,
    availabilityFilter,
    featureFilter,
  ]);

  const {
    data: properties,
    isLoading,
    isFetching,
    isError,
  } = useGetPropertiesQuery({});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const approvalOrder: Record<string, number> = {
    Denied: 0,
    Pending: 1,
    Approved: 2,
  };
  const sortedProperties = properties
    ? [...properties].sort((a, b) => {
        const aOrder = approvalOrder[a.isApproved ?? ""] ?? 3;
        const bOrder = approvalOrder[b.isApproved ?? ""] ?? 3;
        return aOrder - bOrder;
      })
    : [];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProperties = sortedProperties.filter((property) => {
    const propertyStatus = property as PropertyWithStatus;
    const listingLabel = inferListingLabel(propertyStatus);
    const isAvailable = propertyStatus.isAvailable ?? true;

    if (normalizedSearch) {
      const searchableText = [
        property.name,
        property.location?.address,
        property.location?.city,
        property.location?.state,
        property.location?.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(normalizedSearch)) {
        return false;
      }
    }

    if (approvalFilter !== "any" && property.isApproved !== approvalFilter) {
      return false;
    }

    if (listingFilter !== "any" && listingLabel !== listingFilter) {
      return false;
    }

    if (
      propertyTypeFilter !== "any" &&
      property.propertyType !== propertyTypeFilter
    ) {
      return false;
    }

    if (availabilityFilter === "available" && !isAvailable) {
      return false;
    }

    if (availabilityFilter === "unavailable" && isAvailable) {
      return false;
    }

    if (featureFilter === "featured" && !property.isFeatured) {
      return false;
    }

    if (featureFilter === "superFeatured" && !property.isSuperFeatured) {
      return false;
    }

    return true;
  });
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / DEFAULT_PROPERTY_PAGE_SIZE),
  );
  const paginatedProperties = filteredProperties.slice(
    (page - 1) * DEFAULT_PROPERTY_PAGE_SIZE,
    page * DEFAULT_PROPERTY_PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (isLoading) return <Loading />;
  if (isError) return <div>{t("dashboard.errorLoadingProperties")}</div>;

  return (
    <div className="dashboard-container">
      <Headers
        title={t("dashboard.myProperties")}
        subtitle={t("dashboard.manageProperties")}
      />
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("common.search")}</p>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("common.search")}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("application.status")}</p>
            <select
              value={approvalFilter}
              onChange={(event) =>
                setApprovalFilter(
                  event.target.value as "any" | "Pending" | "Approved" | "Denied",
                )
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="any">{t("dashboard.all")}</option>
              <option value="Pending">{t("dashboard.pending")}</option>
              <option value="Approved">{t("dashboard.approved")}</option>
              <option value="Denied">{t("dashboard.denied")}</option>
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("filters.listingLabel")}</p>
            <select
              value={listingFilter}
              onChange={(event) =>
                setListingFilter(
                  event.target.value as "any" | "Monthly" | "Night" | "Sell",
                )
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="any">{t("dashboard.all")}</option>
              {listingOptions.map((label) => (
                <option key={label} value={label}>
                  {translateEnum("listingLabels", label)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("filters.propertyType")}</p>
            <select
              value={propertyTypeFilter}
              onChange={(event) =>
                setPropertyTypeFilter(event.target.value as "any" | PropertyTypeEnum)
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="any">{t("dashboard.all")}</option>
              {Object.values(PropertyTypeEnum).map((type) => (
                <option key={type} value={type}>
                  {translateEnum("propertyTypes", type)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("dashboard.availability")}</p>
            <select
              value={availabilityFilter}
              onChange={(event) =>
                setAvailabilityFilter(
                  event.target.value as "any" | "available" | "unavailable",
                )
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="any">{t("dashboard.all")}</option>
              <option value="available">{t("property.available")}</option>
              <option value="unavailable">{t("property.unavailable")}</option>
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">{t("dashboard.featured")}</p>
            <select
              value={featureFilter}
              onChange={(event) =>
                setFeatureFilter(
                  event.target.value as "any" | "featured" | "superFeatured",
                )
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="any">{t("dashboard.all")}</option>
              <option value="featured">{t("property.featured")}</option>
              <option value="superFeatured">{t("property.superFeatured")}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProperties.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            showEditButton={true}
            onEdit={handleEditClick}
            propertyLink={`/admin/properties/${property.id}`}
          />
        ))}
      </div>
      {filteredProperties.length === 0 && (
        <p>{t("dashboard.noProperties")}</p>
      )}
      <Pagination
        className="mt-8"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isFetching}
      />

      {selectedProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default Properties;
