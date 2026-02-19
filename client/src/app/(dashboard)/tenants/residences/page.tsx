"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Headers from "@/components/Header1";
import Loading from "@/components/Loading";
import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetCurrentResidencesPaginatedQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import { DEFAULT_PROPERTY_PAGE_SIZE } from "@/lib/constants";
import Pagination from "@/components/ui/pagination";
import { Property } from "@/types/prismaTypes";

const Residences = () => {
  const { t } = useTranslations();
  const [page, setPage] = useState(1);
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

  const {
    data: currentResidences,
    isLoading,
    isFetching,
    error,
  } = useGetCurrentResidencesPaginatedQuery(
    {
      cognitoId: authUser?.cognitoInfo?.userId || "",
      page,
      limit: DEFAULT_PROPERTY_PAGE_SIZE,
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    },
  );

  if (isLoading) return <Loading />;
  if (error) return <div>{t("dashboard.noResidences")}</div>;

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
      return;
    }

    await addFavorite({
      cognitoId: authUser.cognitoInfo.userId,
      propertyId,
    });
  };

  return (
    <div className="dashboard-container">
      <Headers
        title={t("dashboard.residences")}
        subtitle={t("dashboard.manageResidences")}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.data.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={
              tenant?.favorites?.some((fav: Property) => fav.id === property.id) ||
              false
            }
            onFavoriteToggle={() => handleFavoriteToggle(property.id)}
            showFavoriteButton={isTenantUser}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!currentResidences || currentResidences.data.length === 0) && (
        <p>{t("dashboard.noResidences")}</p>
      )}
      <Pagination
        className="mt-8"
        page={page}
        totalPages={currentResidences?.pagination.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isFetching}
      />
    </div>
  );
};

export default Residences;
