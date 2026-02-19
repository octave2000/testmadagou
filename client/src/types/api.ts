import { Manager, Property } from "./prismaTypes";

export type ManagerSummary = Manager & {
  propertyCount: number;
  applicationCount: number;
};

export type ListingLabel = "Monthly" | "Night" | "Sell";

export type FeaturePropertyPayload = {
  isFeatured?: boolean;
  featuredUntil?: string;
};

export type SuperFeaturePropertyPayload = {
  isSuperFeatured?: boolean;
  superFeaturedUntil?: string;
};

export type PropertyAvailabilityPayload = {
  isAvailable: boolean;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type PropertyWithStatus = Property & {
  listingLabel?: ListingLabel | string | null;
  label?: ListingLabel | string | null;
  pricePerNight?: number | null;
  isAvailable?: boolean;
  featuredUntil?: string | null;
  superFeaturedUntil?: string | null;
  manager?: Manager | null;
};
