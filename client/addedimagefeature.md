# Main Image Feature (Frontend Guide)

This document explains the backend changes for selecting a main image when creating or updating a property.

## What  added

- `POST /properties` now accepts a main image index.
- `PATCH /properties/:id` now accepts a main image index.
- The selected main image is stored as the first element in `photoUrls`.
- Backward compatible: if no main image index is sent, behavior stays the same.

## Request fields supported

Use any one of these multipart form fields:

- `mainImageIndex` (preferred)
- `mainPhotoIndex` (alias)
- `primaryImageIndex` (alias)

All indexes are **0-based**.

## How backend applies it

- After all photos are resolved (uploaded + kept existing photos on update), backend reorders `photoUrls`.
- The image at the provided index is moved to the front.
- Result: main image is always `photoUrls[0]`.

## Validation rules

- Index must be a non-negative integer.
- Index must be within array bounds.
- If no photos exist and index is provided, request fails.

Possible 400 errors:

- `mainImageIndex must be a non-negative integer`
- `Cannot set mainImageIndex when no photos are provided`
- `mainImageIndex must be between 0 and N`

## Frontend integration

## Create property

Send photos in order, and send `mainImageIndex` for the one user chose as main.

```bash
curl -X POST http://localhost:3001/properties \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "name=Example" \
  -F "description=Example property" \
  -F "priceTotal=500000" \
  -F "securityDeposit=10000" \
  -F "applicationFee=100" \
  -F "beds=2" \
  -F "baths=2" \
  -F "squareFeet=1200" \
  -F "propertyType=Apartment" \
  -F "managerCognitoId=<MANAGER_COGNITO_ID>" \
  -F "mainImageIndex=1" \
  -F "photos=@image1.jpg" \
  -F "photos=@image2.jpg"
```

This makes `image2.jpg` the main image (`photoUrls[0]`).

## Update property

When updating photos:

- `existingPhotos` controls which old photos stay.
- New `photos` are appended after kept `existingPhotos`.
- `mainImageIndex` is applied on the final list.

```bash
curl -X PATCH http://localhost:3001/properties/<PROPERTY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "existingPhotos=https://example.com/old1.jpg" \
  -F "photos=@new1.jpg" \
  -F "photos=@new2.jpg" \
  -F "mainImageIndex=2"
```

Final order before main selection:

- 0: old1
- 1: new1
- 2: new2

After selection (`mainImageIndex=2`):

- 0: new2 (main)
- 1: old1
- 2: new1

## UI recommendation

- Let users pick a main image in the upload preview grid.
- Send the selected preview index as `mainImageIndex`.
- On reads, always treat `photoUrls[0]` as the main/cover image.
