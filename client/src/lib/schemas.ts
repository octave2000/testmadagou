import * as z from "zod";
import { ListingLabelEnum, PropertyTypeEnum } from "@/lib/constants";
import { translate } from "@/lib/i18n";

type Translator = (key: string) => string;

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return Number(value);
  },
  z.number().positive().optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return Number(value);
  },
  z.number().int().positive().optional(),
);

export const buildPropertySchemaBase = (t: Translator) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    description: z.string().min(1, t("validation.descriptionRequired")),
    listingLabel: z.nativeEnum(ListingLabelEnum),
    pricePerMonth: optionalPositiveNumber,
    pricePerNight: optionalPositiveNumber,
    priceTotal: optionalPositiveNumber,
    securityDeposit: z.coerce.number().nonnegative().optional(),
    applicationFee: z.coerce.number().nonnegative().optional(),
    isPetsAllowed: z.boolean(),

    isParkingIncluded: z.boolean(),
    photoUrls: z
      .array(z.instanceof(File))
      .min(1, t("validation.photoRequired")),
    amenities: z.array(z.string().min(1)).default([]),
    highlights: z.array(z.string().min(1)).default([]),

    beds: z.coerce.number().nonnegative().optional(),
    baths: z.coerce.number().nonnegative().optional(),
    squareFeet: z.coerce.number().int().positive(),
    propertyType: z.nativeEnum(PropertyTypeEnum),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),

    latitude: z.coerce
      .number()
      .min(-90, t("validation.latitudeMin"))
      .max(90, t("validation.latitudeMax"))
      .optional(),

    longitude: z.coerce
      .number()
      .min(-180, t("validation.longitudeMin"))
      .max(180, t("validation.longitudeMax"))
      .optional(),
  });

type CoordinateValidationShape = z.ZodRawShape & {
  latitude: z.ZodTypeAny;
  longitude: z.ZodTypeAny;
  propertyType: z.ZodTypeAny;
};

export const applyCoordinateValidation = <T extends CoordinateValidationShape>(
  schema: z.ZodObject<T>,
  t: Translator,
) =>
  schema
    .refine(
      (data) =>
        (data.latitude !== undefined && data.longitude !== undefined) ||
        (data.latitude === undefined && data.longitude === undefined),
      {
        message: t("validation.latLngTogether"),
        path: ["latitude"],
      },
    )
    .superRefine((data, context) => {
      if (
        data.propertyType === PropertyTypeEnum.Land &&
        data.latitude === undefined &&
        data.longitude === undefined
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["latitude"],
          message: t("validation.landCoordinatesRequired"),
        });
      }
    });

export const buildPropertySchema = (t: Translator) =>
  applyCoordinateValidation(buildPropertySchemaBase(t), t)
    .superRefine((data, context) => {
      if (
        data.listingLabel === ListingLabelEnum.Monthly &&
        data.pricePerMonth === undefined
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricePerMonth"],
          message: t("validation.pricePerMonthRequired"),
        });
      }

      if (
        data.listingLabel === ListingLabelEnum.Night &&
        data.pricePerNight === undefined
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pricePerNight"],
          message: t("validation.pricePerNightRequired"),
        });
      }

      if (
        data.listingLabel === ListingLabelEnum.Sell &&
        data.priceTotal === undefined
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priceTotal"],
          message: t("validation.priceTotalRequired"),
        });
      }
    });

const defaultT = (key: string) => translate("en", key);

export const propertySchemaBase = buildPropertySchemaBase(defaultT);
export const propertySchema = buildPropertySchema(defaultT);
export type PropertyFormData = z.infer<typeof propertySchema>;

export const buildApplicationSchema = (
  t: Translator,
  options?: { requireStayDays?: boolean },
) =>
  z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),
      email: z.string().email(t("validation.invalidEmail")),
      phoneNumber: z.string().min(10, t("validation.phoneMin")),
      message: z.string().optional(),
      stayDays: optionalPositiveInteger,
    })
    .superRefine((data, context) => {
      if (options?.requireStayDays && data.stayDays === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stayDays"],
          message: t("validation.stayDaysRequired"),
        });
      }
    });

export const applicationSchema = buildApplicationSchema(defaultT);
export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const buildSettingsSchema = (t: Translator) =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    email: z.string().email(t("validation.invalidEmail")),
    phoneNumber: z.string().min(10, t("validation.phoneMin")),
  });

export const settingsSchema = buildSettingsSchema(defaultT);
export type SettingsFormData = z.infer<typeof settingsSchema>;
