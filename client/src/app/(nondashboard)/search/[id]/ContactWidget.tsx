import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery, useGetPropertyQuery } from "@/state/api";
import { Mail, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useTranslations } from "@/lib/i18n-client";

const ContactWidget = ({ onOpenModal, propertyId }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property } = useGetPropertyQuery(propertyId);
  const router = useRouter();
  const { t } = useTranslations();

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      <div className="mb-4 border border-primary-200 p-4 rounded-xl space-y-3">
        <p className="font-semibold text-primary-800">{t("contact.managerContact")}</p>
        <div className="flex items-start gap-3 text-sm text-primary-700">
          <UserRound size={16} className="mt-0.5 shrink-0" />
          <span>
            {t("contact.managerName")}:{" "}
            {property?.manager?.name || t("contact.notAvailable")}
          </span>
        </div>
        <div className="flex items-start gap-3 text-sm text-primary-700">
          <Mail size={16} className="mt-0.5 shrink-0" />
          {property?.manager?.email ? (
            <a
              href={`mailto:${property.manager.email}`}
              className="hover:underline break-all"
            >
              {t("contact.managerEmail")}: {property.manager.email}
            </a>
          ) : (
            <span>
              {t("contact.managerEmail")}: {t("contact.notAvailable")}
            </span>
          )}
        </div>
        <div className="flex items-start gap-3 text-sm text-primary-700">
          <Phone size={16} className="mt-0.5 shrink-0" />
          {property?.manager?.phoneNumber ? (
            <a
              href={`tel:${property.manager.phoneNumber}`}
              className="hover:underline"
            >
              {t("contact.managerPhone")}: {property.manager.phoneNumber}
            </a>
          ) : (
            <span>
              {t("contact.managerPhone")}: {t("contact.notAvailable")}
            </span>
          )}
        </div>
      </div>
      {/*<div className="flex items-center gap-5 mb-4 border border-primary-200 p-4 rounded-xl">
        <div className="flex items-center p-4 bg-primary-900 rounded-full">
          <Phone className="text-primary-50" size={15} />
        </div>
        <div>
          <p>Contact This Property</p>
          <div className="text-lg font-bold text-primary-800">
            (424) 340-5574
          </div>
        </div>
      </div>*/}
      <Button
        className="w-full bg-primary-700 text-white hover:bg-primary-600"
        onClick={handleButtonClick}
      >
        {authUser ? t("contact.submitApplication") : t("contact.signInToApply")}
      </Button>

      <hr className="my-4" />
      <div className="text-sm">
        <div className="text-primary-600 mb-1">
          {t("contact.language")}: {t("language.english")},{" "}
          {t("language.french")}.
        </div>
        <div className="text-primary-600">
          {t("contact.openByAppointment")}
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
