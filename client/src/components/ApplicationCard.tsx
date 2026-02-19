"use client";

import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n-client";
import { useAppSelector } from "@/state/redux";
import { formatCurrencyAmount } from "@/lib/currency";
import {
  getPriceUnitTranslationKey,
  inferListingLabel,
  getPrimaryPriceAmount,
} from "@/lib/property-pricing";
import { PropertyWithStatus } from "@/types/api";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const { t } = useTranslations();
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg"
  );
  const currency = useAppSelector((state) => state.global.currency);
  const listingProperty = application.property as PropertyWithStatus;
  const priceAmount = getPrimaryPriceAmount(listingProperty);
  const priceLabel = formatCurrencyAmount(priceAmount, currency);
  const priceUnitKey = getPriceUnitTranslationKey(listingProperty);
  const isNightListing = inferListingLabel(listingProperty) === "Night";
  const isCustomerApplication = userType !== "manager";
  const priceUnitLabel = priceUnitKey
    ? priceUnitKey === "property.forSale" && isCustomerApplication
      ? t("header.buy")
      : t(priceUnitKey)
    : "";

  const contactPerson =
    userType === "manager" ? application.tenant : application.manager;

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white mb-4">
      <div className="flex flex-col lg:flex-row  items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2">
                {application.property.name}
              </h2>
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{`${application.property.location.city}, ${application.property.location.country}`}</span>
              </div>
            </div>
            <div className="text-xl font-semibold">
              {priceLabel}{" "}
              {priceUnitKey && (
                <span className="text-sm font-normal">
                  {priceUnitLabel}
                </span>
              )}
              {isNightListing && application.stayDays ? (
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  • {application.stayDays} {t("application.days")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-lg font-semibold">
              {userType === "manager"
                ? t("application.tenant")
                : t("application.manager")}
            </div>
            <hr className="mt-3" />
          </div>
          <div className="flex gap-4">
            <div>
              <Image
                src="/landing-i1.png"
                alt={contactPerson.name}
                width={40}
                height={40}
                className="rounded-full mr-2 min-w-[40px] min-h-[40px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold">{contactPerson.name}</div>
              <div className="text-sm flex items-center text-primary-600">
                <PhoneCall className="w-5 h-5 mr-2" />
                {contactPerson.phoneNumber}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <Mail className="w-5 h-5 mr-2" />
                {contactPerson.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />
      {children}
    </div>
  );
};

export default ApplicationCard;
