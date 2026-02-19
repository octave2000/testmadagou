import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesPaginatedQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";
import Card from "@/components/Card";
import React from "react";
import CardCompact from "@/components/CardCompact";
import { useTranslations } from "@/lib/i18n-client";
import { DEFAULT_PROPERTY_PAGE_SIZE } from "@/lib/constants";
type ListingsProps = {
  page: number;
};

const Listings = ({ page }: ListingsProps) => {
  const { t } = useTranslations();
  const { data: authUser } = useGetAuthUserQuery();
  const isTenantUser = authUser?.userRole === "tenant";
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId || !isTenantUser,
    },
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);
  const approvedFilters = { ...filters, isApproved: true };

  const {
    data: propertiesResponse,
    isLoading,
    isError,
  } = useGetPropertiesPaginatedQuery({
    ...approvedFilters,
    page,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
  });
  const properties = propertiesResponse?.data ?? [];

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser?.cognitoInfo?.userId || !isTenantUser) return;

    const isFavorite = tenant?.favorites?.some(
      (fav: Property) => fav.id === propertyId,
    );

    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    } else {
      await addFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    }
  };

  if (isLoading) return <>{t("common.loading")}</>;
  if (isError || !propertiesResponse)
    return <div>{t("toasts.fetchPropertiesFailed")}</div>;

  return (
    <div className="w-full">
      <div className="flex">
        <div className="p-4 w-full">
          {properties.map((property) =>
            viewMode === "grid" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id,
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={isTenantUser}
                propertyLink={`/search/${property.id}`}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id,
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={isTenantUser}
                propertyLink={`/search/${property.id}`}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
