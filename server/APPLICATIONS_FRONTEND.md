# Applications API (Frontend)

Base path: `/applications`

Auth: requires `Authorization: Bearer <token>` via `authMiddleware`.

## List applications (latest first)

`GET /applications`

Optional query params:
- `userId`: Cognito user id to filter by.
- `userType`: `tenant` or `manager` (must be paired with `userId`).

Notes:
- Results are sorted by `applicationDate` descending.
- Response includes `property` (with `location`) and `manager` (from property).

Example request:
```http
GET /applications?userId=abc123&userType=manager
Authorization: Bearer <token>
```

Example response:
```json
[
  {
    "id": 12,
    "applicationDate": "2024-09-01T10:22:30.000Z",
    "status": "Pending",
    "propertyId": 7,
    "tenantCognitoId": "tenant-001",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phoneNumber": "+15551234567",
    "message": "Interested in a 12-month lease.",
    "leaseId": null,
    "property": {
      "id": 7,
      "name": "Oak Townhome",
      "description": "3 bed, 2 bath",
      "pricePerMonth": 2200,
      "priceTotal": null,
      "securityDeposit": 1500,
      "isApproved": "Approved",
      "deniedReason": null,
      "isFeatured": false,
      "featuredUntil": null,
      "isSuperFeatured": false,
      "superFeaturedUntil": null,
      "isAvailable": true,
      "applicationFee": 50,
      "photoUrls": [],
      "amenities": [],
      "highlights": [],
      "isPetsAllowed": false,
      "isParkingIncluded": false,
      "beds": 3,
      "baths": 2,
      "squareFeet": 1600,
      "propertyType": "Townhouse",
      "postedDate": "2024-08-20T00:00:00.000Z",
      "averageRating": 0,
      "numberOfReviews": 0,
      "locationId": 3,
      "managerCognitoId": "manager-123",
      "location": {
        "id": 3,
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "country": "US",
        "postalCode": "78701",
        "coordinates": null
      }
    },
    "tenant": {
      "id": 5,
      "cognitoId": "tenant-001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phoneNumber": "+15551234567"
    },
    "manager": {
      "id": 2,
      "cognitoId": "manager-123",
      "name": "Sam Manager",
      "email": "sam@example.com",
      "phoneNumber": "+15557654321"
    }
  }
]
```

## Create an application

`POST /applications`

Body:
```json
{
  "propertyId": 7,
  "tenantCognitoId": "tenant-001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+15551234567",
  "message": "Interested in a 12-month lease.",
  "applicationDate": "2024-09-01T10:22:30.000Z"
}
```

Notes:
- `applicationDate` is optional; if omitted, the server uses `now`.
- Status is set to `Pending` by the server.
- The property can be rent (`pricePerMonth`) or sale (`priceTotal`); one of those must be present.

Example response (201):
```json
{
  "id": 12,
  "applicationDate": "2024-09-01T10:22:30.000Z",
  "status": "Pending",
  "propertyId": 7,
  "tenantCognitoId": "tenant-001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+15551234567",
  "message": "Interested in a 12-month lease.",
  "leaseId": null,
  "property": { "...": "property with location" },
  "tenant": { "...": "tenant info" }
}
```
