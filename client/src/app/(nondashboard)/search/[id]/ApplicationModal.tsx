import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, buildApplicationSchema } from "@/lib/schemas";
import {
  useCreateApplicationMutation,
  useGetAuthUserQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n-client";
import { inferListingLabel } from "@/lib/property-pricing";
import { PropertyWithStatus } from "@/types/api";

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property } = useGetPropertyQuery(propertyId, {
    skip: !isOpen,
  });
  const { t } = useTranslations();
  const applicationSchema = useMemo(() => buildApplicationSchema(t), [t]);
  const isNightlyListing =
    property && inferListingLabel(property as PropertyWithStatus) === "Night";

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
      stayDays: undefined,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!authUser || authUser.userRole !== "tenant") {
      console.error(
        t("auth.needTenant")
      );
      return;
    }

    if (isNightlyListing && !data.stayDays) {
      form.setError("stayDays", { message: t("validation.stayDaysRequired") });
      return;
    }

    await createApplication({
      ...data,
      applicationDate: new Date().toISOString(),
      status: "Pending",
      propertyId: propertyId,
      tenantCognitoId: authUser.cognitoInfo.userId,
      stayDays: isNightlyListing ? data.stayDays : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader className="mb-4">
          <DialogTitle>{t("application.submitTitle")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CustomFormField
              name="name"
              label={t("application.name")}
              type="text"
              placeholder={t("application.namePlaceholder")}
            />
            <CustomFormField
              name="email"
              label={t("application.email")}
              type="email"
              placeholder={t("application.emailPlaceholder")}
            />
            <CustomFormField
              name="phoneNumber"
              label={t("application.phoneNumber")}
              type="text"
              placeholder={t("application.phonePlaceholder")}
            />
            <CustomFormField
              name="message"
              label={t("application.messageOptional")}
              type="textarea"
              placeholder={t("application.messagePlaceholder")}
            />
            {isNightlyListing && (
              <CustomFormField
                name="stayDays"
                label={t("application.stayDays")}
                type="number"
                placeholder={t("application.stayDaysPlaceholder")}
              />
            )}
            <Button type="submit" className="bg-primary-700 text-white w-full">
              {t("contact.submitApplication")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
