"use client";

import Headers from "@/components/Header1";
import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetManagersPaginatedQuery } from "@/state/api";
import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import Pagination from "@/components/ui/pagination";
import { DEFAULT_PROPERTY_PAGE_SIZE } from "@/lib/constants";

const Managers = () => {
  const { t } = useTranslations();
  const [page, setPage] = useState(1);
  const {
    data: managers,
    isLoading,
    isFetching,
    isError,
  } = useGetManagersPaginatedQuery({
    page,
    limit: DEFAULT_PROPERTY_PAGE_SIZE,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>{t("dashboard.errorLoadingManagers")}</div>;

  return (
    <div className="dashboard-container">
      <Headers
        title={t("dashboard.managers")}
        subtitle={t("dashboard.manageManagers")}
      />
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.managerName")}</TableHead>
              <TableHead>{t("dashboard.managerEmail")}</TableHead>
              <TableHead>{t("dashboard.managerPhone")}</TableHead>
              <TableHead className="text-right">
                {t("dashboard.managerProperties")}
              </TableHead>
              <TableHead className="text-right">
                {t("dashboard.managerApplications")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers?.data.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="font-medium">{manager.name}</TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>{manager.phoneNumber}</TableCell>
                <TableCell className="text-right">
                  {manager.propertyCount}
                </TableCell>
                <TableCell className="text-right">
                  {manager.applicationCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(!managers || managers.data.length === 0) && (
        <p className="mt-4 text-sm text-gray-500">
          {t("dashboard.noManagers")}
        </p>
      )}
      <Pagination
        className="mt-6"
        page={page}
        totalPages={managers?.pagination.totalPages ?? 1}
        onPageChange={setPage}
        isLoading={isFetching}
      />
    </div>
  );
};

export default Managers;
