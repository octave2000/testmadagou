# Featured and Super-Featured: Frontend Notes

This doc explains how to use the existing feature endpoints and the new
fields for "featured until" and "super featured until" dates.

## Endpoints

### Feature property
- Method: `PATCH`
- Path: `/properties/:id/feature`
- Body (JSON):
  - `isFeatured` (boolean, optional)
  - `featuredUntil` (string, optional, ISO 8601 date/time)

Behavior:
- If `isFeatured` is `false`, the server clears `featuredUntil`.
- If `featuredUntil` is provided, the server sets `isFeatured` to `true`
  unless `isFeatured` is explicitly `false`.
- If neither field is provided, the server returns `400`.

Example:
```json
{
  "isFeatured": true,
  "featuredUntil": "2025-03-01T00:00:00.000Z"
}
```

### Super-feature property
- Method: `POST`
- Path: `/properties/:id/super-feature`
- Body (JSON):
  - `isSuperFeatured` (boolean, optional)
  - `superFeaturedUntil` (string, optional, ISO 8601 date/time)

Behavior:
- If `isSuperFeatured` is `false`, the server clears `superFeaturedUntil`.
- If `superFeaturedUntil` is provided, the server sets `isSuperFeatured` to
  `true` unless `isSuperFeatured` is explicitly `false`.
- If neither field is provided, the server returns `400`.

Example:
```json
{
  "isSuperFeatured": true,
  "superFeaturedUntil": "2025-03-01T00:00:00.000Z"
}
```

## Manager data on property responses

Both `GET /properties` and `GET /properties/:id` include a `manager` object
on each property.

## Manager summary endpoint

### List managers with counts
- Method: `GET`
- Path: `/managers`
- Response (JSON array):
  - Manager info plus counts:
    - `propertyCount` (number)
    - `applicationCount` (number)

Example response item:
```json
{
  "id": 1,
  "cognitoId": "abc-123",
  "name": "Jane Manager",
  "email": "jane@example.com",
  "phoneNumber": "555-0101",
  "propertyCount": 4,
  "applicationCount": 12
}
```

## Property model fields to display

These fields now exist on each property record:
- `isFeatured` (boolean)
- `featuredUntil` (datetime or null)
- `isSuperFeatured` (boolean)
- `superFeaturedUntil` (datetime or null)
- `isAvailable` (boolean)

## Availability endpoint

### Set availability
- Method: `PATCH`
- Path: `/properties/:id/availability`
- Body (JSON):
  - `isAvailable` (boolean, required)

Behavior:
- If `isAvailable` is not provided as a boolean, the server returns `400`.
- Default property availability is `true` until this endpoint is used.

Example:
```json
{
  "isAvailable": false
}
```

## Frontend types (TypeScript)

Use these as a guide for frontend typing.

```ts
export type Manager = {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type ManagerSummary = Manager & {
  propertyCount: number;
  applicationCount: number;
};

export type Property = {
  id: number;
  name: string;
  description: string;
  pricePerMonth?: number | null;
  priceTotal?: number | null;
  securityDeposit: number;
  isApproved: "Approved" | "Pending" | "Denied";
  deniedReason?: string | null;
  isFeatured: boolean;
  featuredUntil?: string | null;
  isSuperFeatured: boolean;
  superFeaturedUntil?: string | null;
  isAvailable: boolean;
  applicationFee: number;
  photoUrls: string[];
  amenities: string[];
  highlights: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: string;
  postedDate: string;
  averageRating?: number | null;
  numberOfReviews?: number | null;
  locationId: number;
  managerCognitoId: string;
  location: {
    id: number;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
  manager: Manager;
};

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
```

## Suggested UI behaviors

- Toggle switch or checkbox for `isFeatured` and `isSuperFeatured`.
- Date/time picker for `featuredUntil` and `superFeaturedUntil`.
- If the user disables a feature toggle, clear the matching date on submit.
- If the user sets a date, ensure the matching feature toggle is enabled.
