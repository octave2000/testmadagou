"use client";

import { CustomFormField } from "@/components/FormField";
import { Form } from "@/components/ui/form";
import {
  PropertyFormData,
  buildPropertySchema,
} from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import {
  AmenityEnum,
  HighlightEnum,
  ListingLabelEnum,
  PropertyTypeEnum,
} from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Headers from "@/components/Header1";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n-client";
import { translateEnum } from "@/lib/i18n";
import {
  CurrencyCode,
  convertCurrencyAmount,
  toXafAmount,
} from "@/lib/currency";
import Image from "next/image";

const NewProperty = () => {
  const { t } = useTranslations();
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();
  const [addressType, setAddressType] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("XAF");
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const router = useRouter();

  const propertySchema = useMemo(() => buildPropertySchema(t), [t]);
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      listingLabel: ListingLabelEnum.Monthly,
      pricePerMonth: undefined,
      pricePerNight: undefined,
      securityDeposit: 0,
      applicationFee: 0,
      priceTotal: undefined,
      isPetsAllowed: true,
      isParkingIncluded: true,
      amenities: [],
      highlights: [],
      photoUrls: [],
      beds: 1,

      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });
  const onError = (errors: any) => {
    console.log("❌ Validation errors:", errors);
  };

  const onSubmit = async (data: PropertyFormData) => {
    console.log("submitting");
    if (!authUser?.cognitoInfo?.userId) {
      throw new Error("No manager ID found");
    }

    const normalizeAmount = (amount?: number) =>
      amount === undefined ? undefined : toXafAmount(amount, currency);
    const formData = new FormData();
    const normalizedPricePerMonth = normalizeAmount(data.pricePerMonth);
    const normalizedPricePerNight = normalizeAmount(data.pricePerNight);
    const normalizedPriceTotal = normalizeAmount(data.priceTotal);
    const normalizedSecurityDeposit = normalizeAmount(data.securityDeposit);
    const normalizedApplicationFee = normalizeAmount(data.applicationFee);

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("listingLabel", data.listingLabel);
    if (normalizedSecurityDeposit !== undefined) {
      formData.append("securityDeposit", String(normalizedSecurityDeposit));
    }
    if (normalizedApplicationFee !== undefined) {
      formData.append("applicationFee", String(normalizedApplicationFee));
    }
    formData.append("isPetsAllowed", String(data.isPetsAllowed));
    formData.append("isParkingIncluded", String(data.isParkingIncluded));
    if (data.beds !== undefined) formData.append("beds", String(data.beds));
    if (data.baths !== undefined) formData.append("baths", String(data.baths));
    formData.append("squareFeet", String(data.squareFeet));
    formData.append("propertyType", data.propertyType);

    if (data.listingLabel === ListingLabelEnum.Monthly) {
      if (normalizedPricePerMonth !== undefined) {
        formData.append("pricePerMonth", String(normalizedPricePerMonth));
      }
    } else if (data.listingLabel === ListingLabelEnum.Night) {
      if (normalizedPricePerNight !== undefined) {
        formData.append("pricePerNight", String(normalizedPricePerNight));
      }
    } else {
      if (normalizedPriceTotal !== undefined) {
        formData.append("priceTotal", String(normalizedPriceTotal));
      }
    }

    if (data.address) formData.append("address", data.address);
    if (data.city) formData.append("city", data.city);
    if (data.state) formData.append("state", data.state);
    if (data.country) formData.append("country", data.country);
    if (data.postalCode) formData.append("postalCode", data.postalCode);
    if (data.latitude !== undefined) formData.append("latitude", String(data.latitude));
    if (data.longitude !== undefined) formData.append("longitude", String(data.longitude));

    data.amenities.forEach((amenity: string) => {
      formData.append("amenities[]", amenity);
    });
    data.highlights.forEach((highlight: string) => {
      formData.append("highlights[]", highlight);
    });
    data.photoUrls.forEach((file: File) => {
      formData.append("photos", file);
    });
    if (
      mainImageIndex !== null &&
      mainImageIndex >= 0 &&
      mainImageIndex < data.photoUrls.length
    ) {
      formData.append("mainImageIndex", String(mainImageIndex));
    }

    formData.append("managerCognitoId", authUser.cognitoInfo.userId);

    await createProperty(formData).unwrap();
    console.log("done");
    router.push("/managers/properties");
  };

  const handleCurrencyChange = (value: CurrencyCode) => {
    if (value === currency) return;

    const values = form.getValues();
    const convertAmount = (amount?: number) =>
      amount === undefined
        ? undefined
        : convertCurrencyAmount(amount, currency, value);

    form.setValue("pricePerMonth", convertAmount(values.pricePerMonth));
    form.setValue("pricePerNight", convertAmount(values.pricePerNight));
    form.setValue("priceTotal", convertAmount(values.priceTotal));
    form.setValue(
      "securityDeposit",
      convertAmount(values.securityDeposit) ?? 0,
    );
    form.setValue(
      "applicationFee",
      convertAmount(values.applicationFee) ?? 0,
    );

    setCurrency(value);
  };
  const listingLabel = form.watch("listingLabel");
  const selectedPropertyType = form.watch("propertyType");
  const isLandProperty = selectedPropertyType === PropertyTypeEnum.Land;
  const shouldUseCoordinates = isLandProperty || addressType;
  const selectedPhotos = form.watch("photoUrls");
  const photoPreviewUrls = useMemo(
    () =>
      (selectedPhotos ?? []).map((file) =>
        typeof file === "string" ? file : URL.createObjectURL(file),
      ),
    [selectedPhotos],
  );

  useEffect(() => {
    if (isLandProperty && !addressType) {
      setAddressType(true);
    }
  }, [isLandProperty, addressType]);

  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photoPreviewUrls]);

  useEffect(() => {
    const count = selectedPhotos?.length ?? 0;
    if (count === 0) {
      setMainImageIndex(null);
      return;
    }

    setMainImageIndex((previousIndex) => {
      if (previousIndex === null || previousIndex >= count) {
        return 0;
      }
      return previousIndex;
    });
  }, [selectedPhotos]);

  return (
    <div className="dashboard-container">
      <Headers
        title={t("newProperty.title")}
        subtitle={t("newProperty.subtitle")}
      />
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="p-4 space-y-10"
          >
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("newProperty.basicInfo")}
              </h2>
              <div className="space-y-4">
                <CustomFormField
                  name="name"
                  label={t("editProperty.propertyName")}
                />
                <CustomFormField
                  name="description"
                  label={t("editProperty.description")}
                  type="textarea"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Fees */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("newProperty.fees")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Property Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("newProperty.propertyDetails")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField
                  name="beds"
                  label={t("newProperty.beds")}
                  type="number"
                />
                <CustomFormField
                  name="baths"
                  label={t("newProperty.baths")}
                  type="number"
                />
                <CustomFormField
                  name="squareFeet"
                  label={t("editProperty.squareFeet")}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="mt-4">
                <CustomFormField
                  name="propertyType"
                  label={t("editProperty.propertyType")}
                  type="select"
                  options={Object.keys(PropertyTypeEnum).map((type) => ({
                    value: type,
                    label: translateEnum("propertyTypes", type),
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Amenities and Highlights */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("editProperty.amenitiesHighlights")}
              </h2>
              <div className="space-y-6">
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

            <hr className="my-6 border-gray-200" />

            {/* Photos */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {t("editProperty.photos")}
              </h2>
              <CustomFormField
                name="photoUrls"
                className="max-w-4xl mx-auto"
                label={t("newProperty.propertyPhotos")}
                type="file"
                accept="image/*"
                multiple
              />
              {photoPreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">
                    {t("editProperty.selectMainImage")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {t("editProperty.mainImageHelp")}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {photoPreviewUrls.map((url, index) => (
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

            <hr className="my-6 border-gray-200" />

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("newProperty.addressInfo")}
              </h2>
              <div className="flex items-center space-x-2">
                <Switch
                  className="bg-red-500"
                  id="airplane-mode"
                  checked={shouldUseCoordinates}
                  disabled={isLandProperty}
                  onCheckedChange={(value) => {
                    if (!isLandProperty) {
                      setAddressType(value);
                    }
                  }}
                />
                <Label htmlFor="airplane-mode">
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
                <div>
                  <CustomFormField
                    name="longitude"
                    label={t("editProperty.longitude")}
                    className="w-full"
                    type="number"
                  />
                  <CustomFormField
                    name="latitude"
                    label={t("editProperty.latitude")}
                    className="w-full"
                    type="number"
                  />
                </div>
              ) : (
                <>
                  <CustomFormField
                    name="address"
                    label={t("editProperty.address")}
                  />
                  <div className="flex justify-between gap-4">
                    <CustomFormField
                      name="city"
                      label={t("editProperty.city")}
                      className="w-full"
                    />
                    <CustomFormField
                      name="state"
                      label={t("editProperty.state")}
                      className="w-full"
                    />
                    <CustomFormField
                      name="postalCode"
                      label={t("editProperty.postalCode")}
                      className="w-full"
                    />
                  </div>
                  <CustomFormField
                    name="country"
                    label={t("editProperty.country")}
                  />
                </>
              )}
            </div>

            <div className="flex w-full ">
              <Button
                type="submit"
                className="w-52 bg-blue-700 text-white mx-auto"
              >
                {t("newProperty.createProperty")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
