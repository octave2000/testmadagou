"use client";

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
  useGetAuthUserQuery,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { Lease, Payment, Property } from "@/types/prismaTypes";
import {
  ArrowDownToLineIcon,
  Check,
  CreditCard,
  Download,
  Edit,
  FileText,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";
import { formatDate } from "@/lib/date";

const PaymentMethod = () => {
  const { t } = useTranslations();
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mt-10 md:mt-0 flex-1">
      <h2 className="text-2xl font-bold mb-4">
        {t("residence.paymentMethod")}
      </h2>
      <p className="mb-4">{t("residence.paymentMethodSubtitle")}</p>
      <div className="border rounded-lg p-6">
        <div>
          {/* Card Info */}
          <div className="flex gap-10">
            <div className="w-36 h-20 bg-blue-600 flex items-center justify-center rounded-md">
              <span className="text-white text-2xl font-bold">VISA</span>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-5">
                  <h3 className="text-lg font-semibold">
                    {t("residence.visaEnding")}
                  </h3>
                  <span className="text-sm font-medium border border-primary-700 text-primary-700 px-3 py-1 rounded-full">
                    {t("residence.default")}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  <span>{t("residence.expiry")}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span>billing@baseclub.com</span>
              </div>
            </div>
          </div>

          <hr className="my-4" />
          <div className="flex justify-end">
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
              <Edit className="w-5 h-5 mr-2" />
              <span>{t("common.edit")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResidenceCard = ({
  property,
  currentLease,
}: {
  property: Property;
  currentLease: Lease;
}) => {
  const { t, language } = useTranslations();
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex gap-5">
        <div className="w-64 h-32 object-cover bg-slate-500 rounded-xl"></div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="bg-green-500 w-fit text-white px-4 py-1 rounded-full text-sm font-semibold">
              {t("residence.activeLeases")}
            </div>

            <h2 className="text-2xl font-bold my-2">{property.name}</h2>
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 mr-1" />
              <span>
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            ${currentLease.rent}{" "}
            <span className="text-gray-500 text-sm font-normal">
              {t("residence.perNight")}
            </span>
          </div>
        </div>
      </div>
      {/* Dates */}
      <div>
        <hr className="my-4" />
        <div className="flex justify-between items-center">
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">
              {t("application.startDate")}:
            </div>
            <div className="font-semibold">
              {formatDate(currentLease.startDate, language)}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">
              {t("application.endDate")}:
            </div>
            <div className="font-semibold">
              {formatDate(currentLease.endDate, language)}
            </div>
          </div>
          <div className="border-[0.5px] border-primary-300 h-4" />
          <div className="xl:flex">
            <div className="text-gray-500 mr-2">
              {t("application.nextPayment")}:
            </div>
            <div className="font-semibold">
              {formatDate(currentLease.endDate, language)}
            </div>
          </div>
        </div>
        <hr className="my-4" />
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2 w-full">
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
          <User className="w-5 h-5 mr-2" />
          {t("application.manager")}
        </button>
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
          <Download className="w-5 h-5 mr-2" />
          {t("dashboard.downloadAgreement")}
        </button>
      </div>
    </div>
  );
};

const BillingHistory = ({ payments }: { payments: Payment[] }) => {
  const { t, language } = useTranslations();
  return (
    <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {t("billing.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("billing.subtitle")}
          </p>
        </div>
        <div>
          <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
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
              <TableHead>{t("billing.invoice")}</TableHead>
              <TableHead>{t("billing.status")}</TableHead>
              <TableHead>{t("billing.billingDate")}</TableHead>
              <TableHead>{t("billing.amount")}</TableHead>
              <TableHead>{t("billing.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="h-16">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("billing.invoice")} #{payment.id} -{" "}
                    {formatDate(payment.paymentDate, language, {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      payment.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}
                  >
                    {payment.paymentStatus === "Paid" ? (
                      <Check className="w-4 h-4 inline-block mr-1" />
                    ) : null}
                    {payment.paymentStatus === "Paid"
                      ? t("billing.paid")
                      : t("billing.notPaid")}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDate(payment.paymentDate, language)}
                </TableCell>
                <TableCell>${payment.amountPaid.toFixed(2)}</TableCell>
                <TableCell>
                  <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50">
                    <ArrowDownToLineIcon className="w-4 h-4 mr-1" />
                    {t("common.download")}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const Residence = () => {
  const { t, language } = useTranslations();
  const { id } = useParams();
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(Number(id));

  const { data: leases, isLoading: leasesLoading } = useGetLeasesQuery(
    parseInt(authUser?.cognitoInfo?.userId || "0"),
    { skip: !authUser?.cognitoInfo?.userId }
  );
  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(
    leases?.[0]?.id || 0,
    { skip: !leases?.[0]?.id }
  );

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;
  if (!property || propertyError)
    return <div>{t("leases.errorLoadingProperty")}</div>;

  const currentLease = leases?.find(
    (lease) => lease.propertyId === property.id
  );

  return (
    <div className="dashboard-container">
      <div className="w-full mx-auto">
        <div className="md:flex gap-10">
          {currentLease && (
            <ResidenceCard property={property} currentLease={currentLease} />
          )}
          <PaymentMethod />
        </div>
        <BillingHistory payments={payments || []} />
      </div>
    </div>
  );
};

export default Residence;
