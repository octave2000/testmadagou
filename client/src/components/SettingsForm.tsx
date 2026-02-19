import { SettingsFormData, buildSettingsSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "./ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "./ui/button";
import { useTranslations } from "@/lib/i18n-client";

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
}: SettingsFormProps) => {
  const { t } = useTranslations();
  const [editMode, setEditMode] = useState(false);
  const settingsSchema = useMemo(() => buildSettingsSchema(t), [t]);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      form.reset(initialData);
    }
  };

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data);
    setEditMode(false);
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} ${t(
            "settings.title",
          )}`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("settings.description")}
        </p>
      </div>
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <CustomFormField
              name="name"
              label={t("settings.name")}
              disabled={!editMode}
            />
            <CustomFormField
              name="email"
              label={t("settings.email")}
              type="email"
              disabled={!editMode}
            />
            <CustomFormField
              name="phoneNumber"
              label={t("settings.phoneNumber")}
              disabled={!editMode}
            />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={toggleEditMode}
                className="bg-secondary-500 text-white hover:bg-secondary-600"
              >
                {editMode ? t("common.cancel") : t("common.edit")}
              </Button>
              {editMode && (
                <Button
                  type="submit"
                  className="bg-primary-700 text-white hover:bg-primary-800"
                >
                  {t("common.saveChanges")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingsForm;
