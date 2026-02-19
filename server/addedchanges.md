# Added Changes (Frontend Usage)

This file documents how the frontend should use the backend features currently available.

## 1. Featured Property

### Endpoint
- Method: `PATCH`
- Path: `/properties/:id/feature`
- Body:
```json
{
  "isFeatured": true,
  "featuredUntil": "2026-03-01T00:00:00.000Z"
}
```

### Rules
- Send `isFeatured: false` to unfeature a property.
- If `isFeatured` is `false`, backend clears `featuredUntil`.
- If you send only `featuredUntil`, backend sets `isFeatured` to `true`.
- If neither `isFeatured` nor `featuredUntil` is sent, backend returns `400`.

### Frontend UI behavior
- Use a toggle for featured status.
- Use a date/time picker for `featuredUntil`.
- If user turns off featured, clear the date before submit.
- If user sets a date, auto-enable featured.

## 2. Super Featured (Optional)

### Endpoint
- Method: `POST`
- Path: `/properties/:id/super-feature`
- Body:
```json
{
  "isSuperFeatured": true,
  "superFeaturedUntil": "2026-03-15T00:00:00.000Z"
}
```

Rules are the same pattern as normal featured.

## 3. Property Label (Monthly, Night, Sell)

Each property now has a listing label so frontend can filter by intent:
- `Monthly`
- `Night`
- `Sell`

When creating/updating, send either:
- `listingLabel`
- or `label` (alias)

Accepted values are case-insensitive: `monthly`, `night`, `sell`.

### Create/Update examples
- Monthly listing:
  - `listingLabel=monthly`
  - `pricePerMonth=1200`
- Night listing:
  - `listingLabel=night`
  - `pricePerNight=85`
- Sell listing:
  - `listingLabel=sell`
  - `priceTotal=250000`

Backend behavior:
- For `Monthly`, backend requires `pricePerMonth` and clears `pricePerNight` and `priceTotal`.
- For `Night`, backend requires `pricePerNight` and clears `pricePerMonth` and `priceTotal`.
- For `Sell`, backend requires `priceTotal` and clears `pricePerMonth` and `pricePerNight`.

## 4. Filter by Label

Use `GET /properties` with:
- `label`
- or `listingLabel`

Examples:
- `GET /properties?label=monthly`
- `GET /properties?listingLabel=night`
- `GET /properties?label=sell`

You can combine this with other filters.

## 5. Nightly Application Requirement

When a property has `pricePerNight`, application requests must include:
- `stayDays` (positive integer)

### Create Application
- Method: `POST`
- Path: `/applications`
- Body:
```json
{
  "propertyId": 10,
  "tenantCognitoId": "tenant-abc",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+1-555-0100",
  "message": "Interested in booking.",
  "stayDays": 5
}
```

If `stayDays` is missing for nightly properties, backend returns `400`.

## 6. List Filtering for Nightly Price

You can filter nightly listings with:
- `nightPriceMin`
- `nightPriceMax`

Example:
`GET /properties?nightPriceMin=50&nightPriceMax=150`
