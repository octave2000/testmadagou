"use client";

import ImagePreviews from "@/app/(nondashboard)/search/[id]/ImagePreviews";
import PropertyDetails from "@/app/(nondashboard)/search/[id]/PropertyDetails";
import PropertyLocation from "@/app/(nondashboard)/search/[id]/PropertyLocation";
import PropertyOverview from "@/app/(nondashboard)/search/[id]/PropertyOverview";
import { useParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n-client";

const AdminPropertyDetails = () => {
  const { t } = useTranslations();
  const { id } = useParams();
  const propertyId = Number(id);

  return (
    <div className="dashboard-container">
      <Link
        href="/admin/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>{t("leases.backToProperties")}</span>
      </Link>

      <ImagePreviews propertyId={propertyId} />
      <div className="flex flex-col md:flex-row justify-center gap-10 mx-4 md:w-2/3 md:mx-auto mt-12 mb-8">
        <div className="order-2 md:order-1">
          <PropertyOverview propertyId={propertyId} />
          <PropertyDetails propertyId={propertyId} />
          <PropertyLocation propertyId={propertyId} />
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetails;
