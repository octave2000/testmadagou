"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Headers from "@/components/Header1";
import Loading from "@/components/Loading";
import {
  useGetApplicationsPaginatedQuery,
  useGetAuthUserQuery,
} from "@/state/api";
import { Download } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import Pagination from "@/components/ui/pagination";
import { DEFAULT_PROPERTY_PAGE_SIZE } from "@/lib/constants";

const Applications = () => {
  const { t } = useTranslations();
  const [page, setPage] = useState(1);
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: applications,
    isLoading,
    isFetching,
    isError,
  } = useGetApplicationsPaginatedQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
    page,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
  });

  if (isLoading) return <Loading />;
  if (isError || !applications)
    return <div>{t("dashboard.errorFetchingApplications")}</div>;

  return (
    <div className="dashboard-container">
      <Headers
        title={t("dashboard.applications")}
        subtitle={t("dashboard.manageApplications")}
      />
      <div className="w-full">
        {applications?.data.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            userType="renter"
          >
            <div className="flex justify-end gap-5 w-full pb-4 px-4">
              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                          rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />
                {t("dashboard.downloadAgreement")}
              </button>
            </div>
          </ApplicationCard>
        ))}
      </div>
      <Pagination
        className="mt-6"
        page={page}
        totalPages={applications?.pagination.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isFetching}
      />
    </div>
  );
};

export default Applications;
