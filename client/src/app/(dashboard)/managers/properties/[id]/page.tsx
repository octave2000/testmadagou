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
import {
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { ArrowDownToLine, ArrowLeft, Check, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";
import { formatDate } from "@/lib/date";

const PropertyTenants = () => {
  const { t, language } = useTranslations();
  const { id } = useParams();
  const propertyId = Number(id);

  const { data: property, isLoading: propertyLoading } =
    useGetPropertyQuery(propertyId);
  const { data: leases, isLoading: leasesLoading } =
    useGetPropertyLeasesQuery(propertyId);
  const { data: payments, isLoading: paymentsLoading } =
    useGetPaymentsQuery(propertyId);

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;

  const getCurrentMonthPaymentStatus = (leaseId: number) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();
    const currentMonthPayment = payments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getUTCMonth() === currentMonth &&
        new Date(payment.dueDate).getUTCFullYear() === currentYear,
    );
    return currentMonthPayment?.paymentStatus || "Not Paid";
  };

  return (
    <div className="dashboard-container">
      {/* Back to properties page */}
      <Link
        href="/managers/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>{t("leases.backToProperties")}</span>
      </Link>

      <Headers
        title={property?.name || t("leases.myProperty")}
        subtitle={t("leases.manageTenantsSubtitle")}
      />

      <div className="w-full space-y-6">
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {t("leases.tenantsOverview")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("leases.tenantsOverviewSubtitle")}
              </p>
            </div>
            <div>
              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2
              px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
              >
                <Download className="w-5 h-5 mr-2" />
                <span>{t("common.downloadAll")}</span>
              </button>
            </div>
          </div>
          <hr className="mt-4 mb-1" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("leases.tenant")}</TableHead>
                  <TableHead>{t("leases.leasePeriod")}</TableHead>
                  <TableHead>{t("leases.monthlyRent")}</TableHead>
                  <TableHead>{t("leases.currentMonthStatus")}</TableHead>
                  <TableHead>{t("leases.contact")}</TableHead>
                  <TableHead>{t("leases.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases?.map((lease) => (
                  <TableRow key={lease.id} className="h-24">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src="/landing-i1.png"
                          alt={lease.tenant.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold">
                            {lease.tenant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lease.tenant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{formatDate(lease.startDate, language)} -</div>
                      <div>{formatDate(lease.endDate, language)}</div>
                    </TableCell>
                    <TableCell>${lease.rent.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getCurrentMonthPaymentStatus(lease.id) === "Paid"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {getCurrentMonthPaymentStatus(lease.id) === "Paid" && (
                          <Check className="w-4 h-4 inline-block mr-1" />
                        )}
                        {getCurrentMonthPaymentStatus(lease.id) === "Paid"
                          ? t("leases.paid")
                          : t("leases.notPaid")}
                      </span>
                    </TableCell>
                    <TableCell>{lease.tenant.phoneNumber}</TableCell>
                    <TableCell>
                      <button
                        className={`border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex
                      items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50`}
                      >
                        <ArrowDownToLine className="w-4 h-4 mr-1" />
                        {t("dashboard.downloadAgreement")}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTenants;
