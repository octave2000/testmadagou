"use client";

import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  AmenityEnum,
  HighlightEnum,
  ListingLabelEnum,
  PropertyTypeEnum,
} from "@/lib/constants";
import { useUpdatePropertyMutation } from "@/state/api";
import { Property } from "@/types/prismaTypes";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "./ui/sonner";
import { useTranslations } from "@/lib/i18n-client";
import { translateEnum } from "@/lib/i18n";
import {
  CurrencyCode,
  convertCurrencyAmount,
  toXafAmount,
} from "@/lib/currency";
import { PropertyWithStatus } from "@/types/api";
import { inferListingLabel } from "@/lib/property-pricing";

type NumericFieldValue = number | string | null | undefined;

type EditPropertyFormData = {
  name?: string;
  description?: string;
  listingLabel?: ListingLabelEnum;
  pricePerMonth?: NumericFieldValue;
  pricePerNight?: NumericFieldValue;
  priceTotal?: NumericFieldValue;
  securityDeposit?: NumericFieldValue;
  applicationFee?: NumericFieldValue;
  isPetsAllowed?: boolean;
  isParkingIncluded?: boolean;
  newPhotos?: File[];
  amenities?: string[];
  highlights?: string[];
  beds?: NumericFieldValue;
  baths?: NumericFieldValue;
  squareFeet?: NumericFieldValue;
  propertyType?: PropertyTypeEnum;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: NumericFieldValue;
  longitude?: NumericFieldValue;
};

const parseOptionalNumber = (value: NumericFieldValue) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const parseOptionalInteger = (value: NumericFieldValue) => {
  const numericValue = parseOptionalNumber(value);
  if (numericValue === undefined) return undefined;
  return Number.isInteger(numericValue) ? numericValue : Math.trunc(numericValue);
};

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

const toListingLabelEnum = (
  label: ReturnType<typeof inferListingLabel>,
): ListingLabelEnum => {
  if (label === "Night") return ListingLabelEnum.Night;
  if (label === "Sell") return ListingLabelEnum.Sell;
  return ListingLabelEnum.Monthly;
};

const EditPropertyModal = ({
  isOpen,
  onClose,
  property,
}: EditPropertyModalProps) => {
  const { t } = useTranslations();
  const [updateProperty, { isLoading }] = useUpdatePropertyMutation();
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [addressType, setAddressType] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("XAF");
  const propertyStatus = property as PropertyWithStatus;
  const initialListingLabel = toListingLabelEnum(
    inferListingLabel(propertyStatus),
  );

  const form = useForm<EditPropertyFormData>({
    defaultValues: {
      name: property.name,
      description: property.description,
      listingLabel: initialListingLabel,
      pricePerMonth: property.pricePerMonth ?? undefined,
      pricePerNight: propertyStatus.pricePerNight ?? undefined,
      priceTotal: property.priceTotal ?? undefined,
      securityDeposit: property.securityDeposit,
      applicationFee: property.applicationFee,
      isPetsAllowed: property.isPetsAllowed,
      isParkingIncluded: property.isParkingIncluded,
      amenities: property.amenities,
      highlights: property.highlights,
      beds: property.beds,
      baths: property.baths,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType as PropertyTypeEnum,
      address: property.location.address,
      city: property.location.city,
      state: property.location.state,
      country: property.location.country,
      postalCode: property.location.postalCode,
      latitude: property.location.coordinates.latitude,
      longitude: property.location.coordinates.longitude,
      newPhotos: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      setExistingPhotos(property.photoUrls);
      setMainImageIndex(property.photoUrls.length > 0 ? 0 : null);
      setCurrency("XAF");
      const listingLabel = toListingLabelEnum(inferListingLabel(propertyStatus));
      // Check if coordinate-based location
      // If address is empty/null but coordinates exist, assume coordinate-based
      // Adjust logic as per your business rule. Here assuming if address is missing, it's coord-based.
      // Or checking if address fields are empty.
      const isCoords =
        !property.location.address &&
        !!property.location.coordinates.latitude &&
        !!property.location.coordinates.longitude;
      setAddressType(isCoords);

      form.reset({
        name: property.name,
        description: property.description,
        listingLabel,
        pricePerMonth: property.pricePerMonth ?? undefined,
        pricePerNight: propertyStatus.pricePerNight ?? undefined,
        priceTotal: property.priceTotal ?? undefined,
        securityDeposit: property.securityDeposit ?? 0,
        applicationFee: property.applicationFee,
        isPetsAllowed: property.isPetsAllowed,
        isParkingIncluded: property.isParkingIncluded,
        amenities: property.amenities,
        highlights: property.highlights,
        beds: property.beds,
        baths: property.baths,
        squareFeet: property.squareFeet,
        propertyType: property.propertyType as PropertyTypeEnum,
        address: property.location.address,
        city: property.location.city,
        state: property.location.state,
        country: property.location.country,
        postalCode: property.location.postalCode,
        latitude: property.location.coordinates.latitude,
        longitude: property.location.coordinates.longitude,
        newPhotos: [],
      });
    }
  }, [isOpen, property, propertyStatus, form]);

  const newPhotos = form.watch("newPhotos") ?? [];
  const newPhotoPreviewUrls = useMemo(
    () =>
      newPhotos.map((file) =>
        typeof file === "string" ? file : URL.createObjectURL(file),
      ),
    [newPhotos],
  );
  const finalPhotoPreviewUrls = useMemo(
    () => [...existingPhotos, ...newPhotoPreviewUrls],
    [existingPhotos, newPhotoPreviewUrls],
  );

  useEffect(() => {
    return () => {
      newPhotoPreviewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [newPhotoPreviewUrls]);

  useEffect(() => {
    const totalPhotos = finalPhotoPreviewUrls.length;
    if (totalPhotos === 0) {
      setMainImageIndex(null);
      return;
    }

    setMainImageIndex((previousIndex) => {
      if (previousIndex === null || previousIndex >= totalPhotos) {
        return 0;
      }
      return previousIndex;
    });
  }, [finalPhotoPreviewUrls.length]);

  const handleRemovePhoto = (indexToRemove: number) => {
    setExistingPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== indexToRemove),
    );
    setMainImageIndex((currentIndex) => {
      if (currentIndex === null) return null;
      if (currentIndex === indexToRemove) return Math.max(0, currentIndex - 1);
      if (currentIndex > indexToRemove) return currentIndex - 1;
      return currentIndex;
    });
  };

  const onSubmit = async (data: EditPropertyFormData) => {
    const normalizeAmount = (amount: NumericFieldValue) => {
      const numericAmount = parseOptionalNumber(amount);
      return numericAmount === undefined
        ? undefined
        : toXafAmount(numericAmount, currency);
    };
    const formData = new FormData();
    const appendUpdate = (key: string, value: string) => {
      formData.append(key, value);
    };
    const normalizedPricePerMonth = normalizeAmount(data.pricePerMonth);
    const normalizedPricePerNight = normalizeAmount(data.pricePerNight);
    const normalizedPriceTotal = normalizeAmount(data.priceTotal);
    const normalizedSecurityDeposit = normalizeAmount(data.securityDeposit);
    const normalizedApplicationFee = normalizeAmount(data.applicationFee);
    if (data.name !== undefined) appendUpdate("name", data.name ?? "");
    if (data.description !== undefined)
      appendUpdate("description", data.description ?? "");
    if (data.listingLabel) {
      appendUpdate("listingLabel", data.listingLabel);
    }
    if (normalizedPricePerMonth !== undefined) {
      appendUpdate("pricePerMonth", normalizedPricePerMonth.toString());
    }
    if (normalizedPricePerNight !== undefined) {
      appendUpdate("pricePerNight", normalizedPricePerNight.toString());
    }
    if (normalizedPriceTotal !== undefined) {
      appendUpdate("priceTotal", normalizedPriceTotal.toString());
    }
    if (normalizedSecurityDeposit !== undefined) {
      appendUpdate(
        "securityDeposit",
        normalizedSecurityDeposit.toString(),
      );
    }
    if (normalizedApplicationFee !== undefined) {
      appendUpdate(
        "applicationFee",
        normalizedApplicationFee.toString(),
      );
    }
    if (data.isPetsAllowed !== undefined) {
      appendUpdate("isPetsAllowed", data.isPetsAllowed.toString());
    }
    if (data.isParkingIncluded !== undefined) {
      appendUpdate("isParkingIncluded", data.isParkingIncluded.toString());
    }
    const normalizedBeds = parseOptionalNumber(data.beds);
    if (normalizedBeds !== undefined) {
      appendUpdate("beds", normalizedBeds.toString());
    }
    const normalizedBaths = parseOptionalNumber(data.baths);
    if (normalizedBaths !== undefined) {
      appendUpdate("baths", normalizedBaths.toString());
    }
    const normalizedSquareFeet = parseOptionalInteger(data.squareFeet);
    if (normalizedSquareFeet !== undefined) {
      appendUpdate("squareFeet", normalizedSquareFeet.toString());
    }
    if (data.propertyType) {
      appendUpdate("propertyType", data.propertyType);
    }

    // Location
    if (data.address !== undefined) appendUpdate("address", data.address ?? "");
    if (data.city !== undefined) appendUpdate("city", data.city ?? "");
    if (data.state !== undefined) appendUpdate("state", data.state ?? "");
    if (data.country !== undefined) appendUpdate("country", data.country ?? "");
    if (data.postalCode !== undefined)
      appendUpdate("postalCode", data.postalCode ?? "");

    const normalizedLatitude = parseOptionalNumber(data.latitude);
    if (normalizedLatitude !== undefined) {
      appendUpdate("latitude", normalizedLatitude.toString());
    }
    const normalizedLongitude = parseOptionalNumber(data.longitude);
    if (normalizedLongitude !== undefined) {
      appendUpdate("longitude", normalizedLongitude.toString());
    }

    // Arrays
    if (data.amenities) {
      (data.amenities ?? []).forEach((amenity: string) => {
        appendUpdate("amenities", amenity);
      });
    }
    if (data.highlights) {
      (data.highlights ?? []).forEach((highlight: string) => {
        appendUpdate("highlights", highlight);
      });
    }

    // Photos
    const hasNewPhotos = (data.newPhotos?.length ?? 0) > 0;
    existingPhotos.forEach((url) => appendUpdate("existingPhotos", url));
    if (hasNewPhotos) {
      data.newPhotos?.forEach((file) => {
        formData.append("photos", file);
      });
    }
    const totalPhotos = existingPhotos.length + (data.newPhotos?.length ?? 0);
    if (
      mainImageIndex !== null &&
      mainImageIndex >= 0 &&
      mainImageIndex < totalPhotos
    ) {
      appendUpdate("mainImageIndex", String(mainImageIndex));
    }

    await updateProperty({ id: property.id, data: formData });
    onClose();
  };

  const handleCurrencyChange = (value: CurrencyCode) => {
    if (value === currency) return;

    const values = form.getValues();
    const convertAmount = (amount: NumericFieldValue) => {
      const numericAmount = parseOptionalNumber(amount);
      return numericAmount === undefined
        ? undefined
        : convertCurrencyAmount(numericAmount, currency, value);
    };

    form.setValue("pricePerMonth", convertAmount(values.pricePerMonth));
    form.setValue("pricePerNight", convertAmount(values.pricePerNight));
    form.setValue("priceTotal", convertAmount(values.priceTotal));
    form.setValue(
      "securityDeposit",
      convertAmount(values.securityDeposit) ?? 0,
    );
    form.setValue("applicationFee", convertAmount(values.applicationFee) ?? 0);

    setCurrency(value);
  };
  const listingLabel = form.watch("listingLabel");
  const selectedPropertyType = form.watch("propertyType");
  const isLandProperty = selectedPropertyType === PropertyTypeEnum.Land;
  const shouldUseCoordinates = isLandProperty || addressType;

  useEffect(() => {
    if (isLandProperty && !addressType) {
      setAddressType(true);
    }
  }, [isLandProperty, addressType]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Toaster />
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto max-w-4xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex justify-between p-4 items-center align-middle">
            <div>{t("editProperty.editProperty")}</div>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomFormField
                name="name"
                label={t("editProperty.propertyName")}
                placeholder={t("editProperty.propertyName")}
              />
              <CustomFormField
                name="propertyType"
                label={t("editProperty.propertyType")}
                type="select"
                options={Object.values(PropertyTypeEnum).map((type) => ({
                  value: type,
                  label: translateEnum("propertyTypes", type),
                }))}
              />
            </div>

            <CustomFormField
              name="description"
              label={t("editProperty.description")}
              type="textarea"
              placeholder={t("editProperty.describeProperty")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
              <CustomFormField
                name="listingLabel"
                label={t("editProperty.listingLabel")}
                type="select"
                options={Object.values(ListingLabelEnum).map((label) => ({
                  value: label,
                  label: translateEnum("listingLabels", label),
                }))}
              />
              <div className="w-full">
                <Label className="text-sm">{t("editProperty.currency")}</Label>
                <Select
                  value={currency}
                  onValueChange={(value) =>
                    handleCurrencyChange(value as CurrencyCode)
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 p-4">
                    <SelectValue placeholder={t("editProperty.currency")} />
                  </SelectTrigger>
                  <SelectContent className="w-full border-gray-200 shadow">
                    <SelectItem value="XAF">
                      {t("editProperty.currencyXaf")}
                    </SelectItem>
                    <SelectItem value="USD">
                      {t("editProperty.currencyUsd")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {listingLabel === ListingLabelEnum.Sell ? (
                <CustomFormField
                  name="priceTotal"
                  label={t("editProperty.salePrice")}
                  type="number"
                />
              ) : listingLabel === ListingLabelEnum.Night ? (
                <CustomFormField
                  name="pricePerNight"
                  label={t("editProperty.pricePerNight")}
                  type="number"
                />
              ) : (
                <CustomFormField
                  name="pricePerMonth"
                  label={t("editProperty.pricePerMonth")}
                  type="number"
                />
              )}
              <CustomFormField
                name="securityDeposit"
                label={t("editProperty.securityDeposit")}
                type="number"
              />
              <CustomFormField
                name="applicationFee"
                label={t("editProperty.applicationFee")}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CustomFormField
                name="beds"
                label={t("editProperty.beds")}
                type="number"
              />
              <CustomFormField
                name="baths"
                label={t("editProperty.baths")}
                type="number"
              />
              <CustomFormField
                name="squareFeet"
                label={t("editProperty.squareFeet")}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CustomFormField
                name="isPetsAllowed"
                label={t("editProperty.petsAllowed")}
                type="switch"
              />
              <CustomFormField
                name="isParkingIncluded"
                label={t("editProperty.parkingIncluded")}
                type="switch"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("editProperty.location")}
              </h3>
              <div className="flex items-center space-x-2">
                <Switch
                  className="bg-red-500"
                  id="address-mode"
                  checked={shouldUseCoordinates}
                  disabled={isLandProperty}
                  onCheckedChange={(value) => {
                    if (!isLandProperty) {
                      setAddressType(value);
                    }
                  }}
                />
                <Label htmlFor="address-mode">
                  {shouldUseCoordinates
                    ? t("editProperty.useAddress")
                    : t("editProperty.useCoordinates")}
                </Label>
              </div>
              {isLandProperty && (
                <p className="text-sm text-gray-600">
                  {t("validation.landCoordinatesRequired")}
                </p>
              )}

              {shouldUseCoordinates ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomFormField
                    name="longitude"
                    label={t("editProperty.longitude")}
                    type="number"
                  />
                  <CustomFormField
                    name="latitude"
                    label={t("editProperty.latitude")}
                    type="number"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomFormField
                    name="address"
                    label={t("editProperty.address")}
                  />
                  <CustomFormField name="city" label={t("editProperty.city")} />
                  <CustomFormField
                    name="state"
                    label={t("editProperty.state")}
                  />
                  <CustomFormField
                    name="postalCode"
                    label={t("editProperty.postalCode")}
                  />
                  <CustomFormField
                    name="country"
                    label={t("editProperty.country")}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("editProperty.amenitiesHighlights")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomFormField
                  name="amenities"
                  label={t("editProperty.amenities")}
                  type="multi-input"
                  multiple
                  options={Object.keys(AmenityEnum).map((a) => ({
                    value: a,
                    label: translateEnum("amenities", a),
                  }))}
                />
                <CustomFormField
                  name="highlights"
                  label={t("editProperty.highlights")}
                  type="multi-input"
                  multiple
                  options={Object.keys(HighlightEnum).map((h) => ({
                    value: h,
                    label: translateEnum("highlights", h),
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("editProperty.photos")}
              </h3>

              {existingPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {existingPhotos.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Property photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <CustomFormField
                name="newPhotos"
                label={t("editProperty.addNewPhotos")}
                type="file"
                accept="image/*"
                multiple
              />

              {finalPhotoPreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">
                    {t("editProperty.selectMainImage")}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {t("editProperty.mainImageHelp")}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {finalPhotoPreviewUrls.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => setMainImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-md border-2 transition ${
                          mainImageIndex === index
                            ? "border-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={t("property.imageAlt", { index: index + 1 })}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {mainImageIndex === index && (
                          <span className="absolute top-1 left-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                            {t("editProperty.mainImage")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-primary-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPropertyModal;
