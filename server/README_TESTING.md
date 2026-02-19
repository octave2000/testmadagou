# Testing Property Features

This guide explains how to test the newly implemented features for the Property API.

## 1. Create Property with Multiple Photos, Pricing Options, and Coordinates

You can now:
- Upload multiple photos using the `photos` field.
- Choose a main photo using `mainImageIndex` (0-based index from uploaded `photos`).
- Provide `pricePerMonth` (rent) or `priceTotal` (buy).
- Send `amenities` and `highlights` as arrays or comma-separated strings.
- Provide `latitude` and `longitude` manually to bypass auto-geocoding.
- Use `Commercial` as a `propertyType`.

### Example `curl` command:

Note: Replace `<JWT_TOKEN>` with a valid manager token and `<MANAGER_COGNITO_ID>` with a valid manager ID.

```bash
curl -X POST http://localhost:3001/properties \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "name=Commercial Office Space" \
  -F "description=Prime commercial real estate in the city center" \
  -F "priceTotal=500000" \
  -F "securityDeposit=10000" \
  -F "applicationFee=100" \
  -F "beds=0" \
  -F "baths=2" \
  -F "squareFeet=2000" \
  -F "propertyType=Commercial" \
  -F "address=123 Business Rd" \
  -F "city=Metropolis" \
  -F "state=NY" \
  -F "country=USA" \
  -F "postalCode=10001" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "managerCognitoId=410ca218-0071-70cf-de33-6902ae686db2" \
  -F "amenities=Parking" \
  -F "amenities=WiFi" \
  -F "highlights=GreatView" \
  -F "highlights=RecentlyRenovated" \
  -F "mainImageIndex=1" \
  -F "photos=@image.jpg" \
  -F "photos=@image2.jpg"
```

`mainImageIndex=1` makes the second uploaded photo the main image (stored as the first item in `photoUrls`).

## 2. Get Properties with Pricing Filters

You can filter by monthly price or total buy price.

### Filter by Monthly Price (Rent):
```bash
curl "http://localhost:3000/properties?priceMin=1000&priceMax=3000"
```

### Filter by Total Price (Buy):
```bash
curl "http://localhost:3001/properties?buyPriceMin=400000&buyPriceMax=600000"
```

### Filter by Property Type (including Commercial):
```bash
curl "http://localhost:3001/properties?propertyType=Commercial"
```

## 3. Verify Coordinates in Response

When fetching a single property or listing them, the coordinates are returned in the `location` object.

## 4. Test Application Creation (Validation)

Ensure you cannot create an application for a property that is "For Sale" (Commercial) and has no monthly rent.

1.  **Create a Commercial Property (Buy Only)** using the command in section 1, but explicitly set `pricePerMonth` (rent) to null (or omit it if your updated code handles omission as null, though `curl` might send empty string).
    *   Actually, create it without `pricePerMonth` field or with `priceTotal` only.

2.  **Try to create an Application** for this property.

```bash
curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationDate": "2025-01-01",
    "status": "Pending",
    "propertyId": <COMMERCIAL_PROPERTY_ID>,
    "tenantCognitoId": "<TENANT_COGNITO_ID>",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "555-1234",
    "message": "Interested in buying"
  }'
```

**Expected Result:**
- HTTP 400 Bad Request
- JSON: `{"message": "Property is not for rent"}`

## 5. Update Property Details

You can now update an existing property's details using `PATCH /properties/:id`.

Supported updates:
- Text fields: `name`, `description`, `pricePerMonth`, `priceTotal`, etc.
- Location: Provide `address`, `city`, etc., to auto-geocode, or provide `latitude`/`longitude` directly.
- Photos:
    - **Add new photos**: Upload files using `photos` field.
    - **Keep/Delete existing**: Send `existingPhotos` field with the URLs you want to *keep*. If omitted, all existing photos are kept (and new ones appended). To delete all, send empty `existingPhotos`? (Note: `curl` handling of empty arrays might be tricky, try sending empty string if logic supports it, or just send the one you want to keep).
    - **Set main photo**: Send `mainImageIndex` to choose the main photo from the final photo list.

### Example `curl` command (Update name, price, and add a photo, keeping one old photo):

```bash
curl -X PATCH http://localhost:3001/properties/<PROPERTY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "name=Updated Office Name" \
  -F "priceTotal=550000" \
  -F "amenities=Parking" \
  -F "amenities=Gym" \
  -F "mainImageIndex=0" \
  -F "photos=@new_image.jpg" \
  -F "existingPhotos=https://example.com/old_photo_to_keep.jpg"
```

### Example `curl` command (Update Address and Auto-Geocode):

```bash
curl -X PATCH http://localhost:3001/properties/<PROPERTY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "address=456 New Business Rd" \
  -F "city=Gotham" \
  -F "state=NY" \
  -F "postalCode=10002"
```

## 6. Test Property Approval

You can approve a property using `PATCH /properties/:id/approve`.

### Example `curl` command:

```bash
curl -X PATCH http://localhost:3001/properties/<PROPERTY_ID>/approve \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Result:**
- HTTP 200 OK
- JSON object of the updated property with `"isApproved": true`.

## 7. Test Advanced Filtering

You can combine multiple filters to narrow down results.

### Example: Filter by Beds, Baths, and Square Feet
```bash
curl "http://localhost:3001/properties?beds=2&baths=1.5&squareFeetMin=500&squareFeetMax=1500"
```

### Example: Filter by Amenities
Multiple amenities can be provided as a comma-separated list.
```bash
curl "http://localhost:3001/properties?amenities=Pool,Gym,WiFi"
```

### Example: Filter by Proximity (within 1000km)
```bash
curl "http://localhost:3001/properties?latitude=34.0522&longitude=-118.2437"
```

## 8. Test Favorite Properties

If you have a list of property IDs that a user has favorited, you can retrieve just those properties.

### Example `curl` command:
```bash
curl "http://localhost:3001/properties?favoriteIds=1,2,5"
```

## 9. Test Property Featuring

You can now mark a property as "Featured" using `PATCH /properties/:id/feature`.

### Feature a Property:
```bash
curl -X PATCH http://localhost:3001/properties/<PROPERTY_ID>/feature \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Result:**
- HTTP 200 OK
- JSON object of the updated property with `"isFeatured": true`.

### Filter by Featured Properties:
You can retrieve only properties that are marked as featured.

```bash
curl "http://localhost:3001/properties?isFeatured=true"
```

## 10. Filter by Approval Status

You can now explicitly filter properties based on their approval status.

### Get Approved Properties:
```bash
curl "http://localhost:3001/properties?isApproved=true"
```
