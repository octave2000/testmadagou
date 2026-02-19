import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import { t } from "@/lib/i18n";
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant,
} from "@/types/prismaTypes";
import {
  FeaturePropertyPayload,
  ManagerSummary,
  PaginatedResponse,
  PaginationParams,
  PropertyAvailabilityPayload,
  SuperFeaturePropertyPayload,
} from "@/types/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { FiltersState } from ".";

const unwrapPaginated = <T>(
  response: T[] | PaginatedResponse<T>,
): T[] => {
  if (Array.isArray(response)) return response;
  return response.data;
};

const normalizePaginated = <T>(
  response: T[] | PaginatedResponse<T>,
): PaginatedResponse<T> => {
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
      },
    };
  }
  return response;
};

const buildPropertyQueryParams = (
  filters: Partial<FiltersState> & PaginationParams & { favoriteIds?: number[] },
) => {
  const normalizedListingLabel =
    typeof filters.listingLabel === "string" &&
    filters.listingLabel !== "any" &&
    filters.listingLabel !== ""
      ? filters.listingLabel.toLowerCase()
      : undefined;
  const isNightListing = normalizedListingLabel === "night";
  const isSellListing = normalizedListingLabel === "sell";

  return cleanParams({
    location: filters.location,
    priceMin:
      !isNightListing && !isSellListing ? filters.priceRange?.[0] : undefined,
    priceMax:
      !isNightListing && !isSellListing ? filters.priceRange?.[1] : undefined,
    nightPriceMin: isNightListing ? filters.priceRange?.[0] : undefined,
    nightPriceMax: isNightListing ? filters.priceRange?.[1] : undefined,
    buyPriceMin: isSellListing ? filters.priceRange?.[0] : undefined,
    buyPriceMax: isSellListing ? filters.priceRange?.[1] : undefined,
    beds: filters.beds,
    baths: filters.baths,
    propertyType: filters.propertyType,
    listingLabel: normalizedListingLabel,
    label: normalizedListingLabel,
    squareFeetMin: filters.squareFeet?.[0],
    squareFeetMax: filters.squareFeet?.[1],
    amenities: filters.amenities?.join(","),
    availableFrom: filters.availableFrom,
    favoriteIds: filters.favoriteIds?.join(","),
    latitude: filters.coordinates?.[1],
    longitude: filters.coordinates?.[0],
    isFeatured: filters.isFeatured,
    isApproved: filters.isApproved,
    page: filters.page,
    limit: filters.limit,
  });
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
  ],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          // if user doesn't exist, create new user
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ,
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return {
            error: error.message || t("toasts.fetchUserFailed"),
          };
        }
      },
    }),

    // property related endpoints
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & PaginationParams & { favoriteIds?: number[] }
    >({
      query: (filters) => ({
        url: "properties",
        params: buildPropertyQueryParams(filters),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => unwrapPaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchPropertiesFailed"),
        });
      },
    }),
    getPropertiesPaginated: build.query<
      PaginatedResponse<Property>,
      Partial<FiltersState> & PaginationParams & { favoriteIds?: number[] }
    >({
      query: (filters) => ({
        url: "properties",
        params: buildPropertyQueryParams(filters),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => normalizePaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchPropertiesFailed"),
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.loadPropertyFailed"),
        });
      },
    }),

    approveProperty: build.mutation<Property, { id: number }>({
      query: ({ id }) => ({
        url: `properties/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["PropertyDetails"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.approvePropertySuccess"),
          error: t("toasts.approvePropertyFailed"),
        });
      },
    }),
    featureProperty: build.mutation<
      Property,
      { id: number; data: FeaturePropertyPayload }
    >({
      query: ({ id, data }) => ({
        url: `properties/${id}/feature`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PropertyDetails"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.featurePropertySuccess"),
          error: t("toasts.approvePropertyFailed"),
        });
      },
    }),
    superFeatureProperty: build.mutation<
      Property,
      { id: number; data: SuperFeaturePropertyPayload }
    >({
      query: ({ id, data }) => ({
        url: `properties/${id}/super-feature`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PropertyDetails"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.featurePropertySuccess"),
          error: t("toasts.approvePropertyFailed"),
        });
      },
    }),
    setPropertyAvailability: build.mutation<
      Property,
      { id: number; data: PropertyAvailabilityPayload }
    >({
      query: ({ id, data }) => ({
        url: `properties/${id}/availability`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PropertyDetails", "Properties"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.updateAvailabilitySuccess"),
          error: t("toasts.updateAvailabilityFailed"),
        });
      },
    }),

    declineProperty: build.mutation<Property, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `properties/${id}/deny`,
        method: "PATCH",
        body: reason,
      }),
      invalidatesTags: ["PropertyDetails"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.declinePropertySuccess"),
          error: t("toasts.approvePropertyFailed"),
        });
      },
    }),

    // tenant related endpoints
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.loadTenantFailed"),
        });
      },
    }),

    getCurrentResidences: build.query<
      Property[],
      { cognitoId: string } & PaginationParams
    >({
      query: ({ cognitoId, page, limit }) => ({
        url: `tenants/${cognitoId}/current-residences`,
        params: cleanParams({ page, limit }),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => unwrapPaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchResidencesFailed"),
        });
      },
    }),
    getCurrentResidencesPaginated: build.query<
      PaginatedResponse<Property>,
      { cognitoId: string } & PaginationParams
    >({
      query: ({ cognitoId, page, limit }) => ({
        url: `tenants/${cognitoId}/current-residences`,
        params: cleanParams({ page, limit }),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => normalizePaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchResidencesFailed"),
        });
      },
    }),

    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.updateSettingsSuccess"),
          error: t("toasts.updateSettingsFailed"),
        });
      },
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.addFavoriteSuccess"),
          error: t("toasts.addFavoriteFailed"),
        });
      },
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.removeFavoriteSuccess"),
          error: t("toasts.removeFavoriteFailed"),
        });
      },
    }),

    // manager related endpoints
    getManagerProperties: build.query<
      Property[],
      { cognitoId: string } & PaginationParams
    >({
      query: ({ cognitoId, page, limit }) => ({
        url: `managers/${cognitoId}/properties`,
        params: cleanParams({ page, limit }),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => unwrapPaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.loadManagerFailed"),
        });
      },
    }),
    getManagerPropertiesPaginated: build.query<
      PaginatedResponse<Property>,
      { cognitoId: string } & PaginationParams
    >({
      query: ({ cognitoId, page, limit }) => ({
        url: `managers/${cognitoId}/properties`,
        params: cleanParams({ page, limit }),
      }),
      transformResponse: (
        response: Property[] | PaginatedResponse<Property>,
      ) => normalizePaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.loadManagerFailed"),
        });
      },
    }),
    getManagers: build.query<ManagerSummary[], void>({
      query: () => "managers",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Managers" as const, id })),
              { type: "Managers", id: "LIST" },
            ]
          : [{ type: "Managers", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchManagersFailed"),
        });
      },
    }),
    getManagersPaginated: build.query<
      PaginatedResponse<ManagerSummary>,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "managers",
        params: cleanParams({
          page: params?.page,
          limit: params?.limit,
        }),
      }),
      transformResponse: (
        response: ManagerSummary[] | PaginatedResponse<ManagerSummary>,
      ) => normalizePaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Managers" as const, id })),
              { type: "Managers", id: "LIST" },
            ]
          : [{ type: "Managers", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchManagersFailed"),
        });
      },
    }),

    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.updateSettingsSuccess"),
          error: t("toasts.updateSettingsFailed"),
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
        headers: {
          "Content-Type": undefined,
        },
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.createPropertySuccess"),
          error: t("toasts.createPropertyFailed"),
        });
      },
    }),

    updateProperty: build.mutation<Property, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `properties/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Properties", id },
        { type: "Properties", id: "LIST" },
        { type: "PropertyDetails", id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.updatePropertySuccess"),
          error: t("toasts.updatePropertyFailed"),
        });
      },
    }),
    deleteProperty: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Properties", id },
        { type: "Properties", id: "LIST" },
        { type: "PropertyDetails", id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.deletePropertySuccess"),
          error: t("toasts.deletePropertyFailed"),
        });
      },
    }),

    // lease related enpoints
    getLeases: build.query<Lease[], number>({
      query: () => "leases",
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchLeasesFailed"),
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchPropertyLeasesFailed"),
        });
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchPaymentsFailed"),
        });
      },
    }),

    // application related endpoints
    getApplications: build.query<
      Application[],
      { userId?: string; userType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }

        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchApplicationsFailed"),
        });
      },
    }),
    getApplicationsPaginated: build.query<
      PaginatedResponse<Application>,
      { userId?: string; userType?: string } & PaginationParams
    >({
      query: (params) => {
        const queryParams = cleanParams({
          userId: params.userId,
          userType: params.userType,
          page: params.page,
          limit: params.limit,
        });

        return { url: "applications", params: queryParams };
      },
      transformResponse: (
        response: Application[] | PaginatedResponse<Application>,
      ) => normalizePaginated(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Applications" as const,
                id,
              })),
              { type: "Applications", id: "LIST" },
            ]
          : [{ type: "Applications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: t("toasts.fetchApplicationsFailed"),
        });
      },
    }),

    updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.updateApplicationSuccess"),
          error: t("toasts.updateApplicationFailed"),
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: t("toasts.createApplicationSuccess"),
          error: t("toasts.createApplicationFailed"),
        });
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useFeaturePropertyMutation,
  useSuperFeaturePropertyMutation,
  useGetPropertiesQuery,
  useGetPropertiesPaginatedQuery,
  useDeclinePropertyMutation,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetCurrentResidencesPaginatedQuery,
  useGetManagerPropertiesQuery,
  useGetManagerPropertiesPaginatedQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useApprovePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useGetApplicationsPaginatedQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
  useSetPropertyAvailabilityMutation,
  useGetManagersQuery,
  useGetManagersPaginatedQuery,
  useDeletePropertyMutation,
} = api;
