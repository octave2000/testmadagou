import { PropertyWithStatus } from "@/types/api";

export type ListingLabelValue = "Monthly" | "Night" | "Sell";

type PricingProperty = Pick<
  PropertyWithStatus,
  "listingLabel" | "label" | "pricePerMonth" | "pricePerNight" | "priceTotal"
>;

const toLower = (value?: string | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const normalizeListingLabel = (
  value?: string | null,
): ListingLabelValue | null => {
  const normalized = toLower(value);
  if (normalized === "monthly") return "Monthly";
  if (normalized === "night") return "Night";
  if (normalized === "sell") return "Sell";
  return null;
};

export const inferListingLabel = (property: PricingProperty): ListingLabelValue => {
  const fromListingLabel =
    normalizeListingLabel(property.listingLabel) ??
    normalizeListingLabel(property.label);
  if (fromListingLabel) return fromListingLabel;

  if (property.pricePerNight !== null && property.pricePerNight !== undefined) {
    return "Night";
  }
  if (property.pricePerMonth !== null && property.pricePerMonth !== undefined) {
    return "Monthly";
  }
  return "Sell";
};

export const getPrimaryPriceAmount = (property: PricingProperty): number => {
  const label = inferListingLabel(property);
  if (label === "Night") return property.pricePerNight ?? 0;
  if (label === "Monthly") return property.pricePerMonth ?? 0;
  return property.priceTotal ?? 0;
};

export const getPriceUnitTranslationKey = (
  property: PricingProperty,
): "property.perMo" | "property.perNight" | "property.forSale" | null => {
  const label = inferListingLabel(property);
  if (label === "Monthly") return "property.perMo";
  if (label === "Night") return "property.perNight";
  return "property.forSale";
};

export const getPriceCategoryTranslationKey = (
  property: PricingProperty,
): "property.monthlyRent" | "property.nightlyRent" | "property.forSale" => {
  const label = inferListingLabel(property);
  if (label === "Night") return "property.nightlyRent";
  if (label === "Monthly") return "property.monthlyRent";
  return "property.forSale";
};
