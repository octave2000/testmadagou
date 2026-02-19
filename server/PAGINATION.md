# Pagination

The following endpoints support optional pagination when listing properties.
Pagination is enabled only when either `page` or `limit` is provided as a
query parameter.

## Query Parameters

- `page` (number, optional): 1-based page index. Defaults to `1` when
  pagination is enabled.
- `limit` (number, optional): number of items per page. Defaults to `20` when
  pagination is enabled.

If neither `page` nor `limit` is provided, the endpoints return the full list
as an array (backward-compatible behavior).

## Response Shape When Paginating

When pagination is enabled, the response changes from a raw array to an object
with `data` and `pagination`:

```json
{
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 123,
    "totalPages": 7
  }
}
```

## Endpoints

### List Properties

`GET /properties`

Example:

`GET /properties?page=2&limit=25`

### Manager Properties

`GET /managers/:cognitoId/properties`

Example:

`GET /managers/abc-123/properties?page=1&limit=10`

### Tenant Current Residences

`GET /tenants/:cognitoId/residences`

Example:

`GET /tenants/abc-123/residences?page=3&limit=15`
