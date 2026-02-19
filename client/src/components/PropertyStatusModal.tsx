"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  useFeaturePropertyMutation,
  useSetPropertyAvailabilityMutation,
  useSuperFeaturePropertyMutation,
} from "@/state/api";
import { PropertyWithStatus } from "@/types/api";
import { useTranslations } from "@/lib/i18n-client";

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toIsoString = (value: string) =>
  value ? new Date(value).toISOString() : undefined;

type PropertyStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyWithStatus;
  canEditFeatures?: boolean;
};

const PropertyStatusModal = ({
  isOpen,
  onClose,
  property,
  canEditFeatures = true,
}: PropertyStatusModalProps) => {
  const { t } = useTranslations();
  const [featureProperty, { isLoading: isFeaturing }] =
    useFeaturePropertyMutation();
  const [superFeatureProperty, { isLoading: isSuperFeaturing }] =
    useSuperFeaturePropertyMutation();
  const [setPropertyAvailability, { isLoading: isUpdatingAvailability }] =
    useSetPropertyAvailabilityMutation();

  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState("");
  const [isSuperFeatured, setIsSuperFeatured] = useState(false);
  const [superFeaturedUntil, setSuperFeaturedUntil] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [initialValues, setInitialValues] = useState({
    isFeatured: false,
    featuredUntil: "",
    isSuperFeatured: false,
    superFeaturedUntil: "",
    isAvailable: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const nextInitial = {
      isFeatured: property.isFeatured,
      featuredUntil: toDateTimeLocal(property.featuredUntil),
      isSuperFeatured: property.isSuperFeatured,
      superFeaturedUntil: toDateTimeLocal(property.superFeaturedUntil),
      isAvailable: property.isAvailable ?? true,
    };
    setInitialValues(nextInitial);
    setIsFeatured(nextInitial.isFeatured);
    setFeaturedUntil(nextInitial.featuredUntil);
    setIsSuperFeatured(nextInitial.isSuperFeatured);
    setSuperFeaturedUntil(nextInitial.superFeaturedUntil);
    setIsAvailable(nextInitial.isAvailable);
  }, [isOpen, property]);

  const hasFeatureChanges =
    canEditFeatures &&
    (isFeatured !== initialValues.isFeatured ||
      featuredUntil !== initialValues.featuredUntil);
  const hasSuperFeatureChanges =
    canEditFeatures &&
    (isSuperFeatured !== initialValues.isSuperFeatured ||
      superFeaturedUntil !== initialValues.superFeaturedUntil);
  const hasAvailabilityChanges = isAvailable !== initialValues.isAvailable;

  const hasChanges = useMemo(
    () => hasFeatureChanges || hasSuperFeatureChanges || hasAvailabilityChanges,
    [hasAvailabilityChanges, hasFeatureChanges, hasSuperFeatureChanges],
  );

  const handleSave = async () => {
    const updates: Promise<unknown>[] = [];
    if (canEditFeatures && hasFeatureChanges) {
      const payload = {
        isFeatured,
        ...(isFeatured && featuredUntil
          ? { featuredUntil: toIsoString(featuredUntil) }
          : {}),
      };
      updates.push(featureProperty({ id: property.id, data: payload }));
    }
    if (canEditFeatures && hasSuperFeatureChanges) {
      const payload = {
        isSuperFeatured,
        ...(isSuperFeatured && superFeaturedUntil
          ? { superFeaturedUntil: toIsoString(superFeaturedUntil) }
          : {}),
      };
      updates.push(superFeatureProperty({ id: property.id, data: payload }));
    }
    if (hasAvailabilityChanges) {
      updates.push(
        setPropertyAvailability({
          id: property.id,
          data: { isAvailable },
        }),
      );
    }
    if (updates.length > 0) {
      await Promise.all(updates);
    }
    onClose();
  };

  const isSaving = isFeaturing || isSuperFeaturing || isUpdatingAvailability;

  const handleFeaturedToggle = (checked: boolean) => {
    setIsFeatured(checked);
    if (!checked) {
      setFeaturedUntil("");
    }
  };

  const handleFeaturedUntilChange = (value: string) => {
    setFeaturedUntil(value);
    if (value) {
      setIsFeatured(true);
    }
  };

  const handleSuperFeaturedToggle = (checked: boolean) => {
    setIsSuperFeatured(checked);
    if (!checked) {
      setSuperFeaturedUntil("");
    }
  };

  const handleSuperFeaturedUntilChange = (value: string) => {
    setSuperFeaturedUntil(value);
    if (value) {
      setIsSuperFeatured(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dashboard.propertyControls")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {canEditFeatures && (
            <>
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("dashboard.featured")}
                  </span>
                  <Switch
                    checked={isFeatured}
                    onCheckedChange={handleFeaturedToggle}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">
                    {t("dashboard.featuredUntil")}
                  </label>
                  <Input
                    type="datetime-local"
                    value={featuredUntil}
                    onChange={(event) =>
                      handleFeaturedUntilChange(event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("dashboard.superFeatured")}
                  </span>
                  <Switch
                    checked={isSuperFeatured}
                    onCheckedChange={handleSuperFeaturedToggle}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">
                    {t("dashboard.superFeaturedUntil")}
                  </label>
                  <Input
                    type="datetime-local"
                    value={superFeaturedUntil}
                    onChange={(event) =>
                      handleSuperFeaturedUntilChange(event.target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("dashboard.availability")}
              </span>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primary-700 text-white"
          >
            {isSaving ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyStatusModal;
