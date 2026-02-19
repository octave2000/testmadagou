# Pagination Updates (Applications + Managers)

These endpoints now accept pagination query params:
- `page`: 1-based page number (default `1`)
- `limit`: page size (default `20`)

If either `page` or `limit` is provided, the response shape becomes:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Applications

Endpoint:
- `GET /applications`

Notes:
- Sorted by `applicationDate` descending (latest first).
- Optional filters: `userId` + `userType` (`tenant` or `manager`).

Example:
```http
GET /applications?page=1&limit=10&userType=manager&userId=abc123
Authorization: Bearer <token>
```

## Managers

Endpoint:
- `GET /managers`

Notes:
- Sorted by manager `id` descending.
- Returns manager summary with `propertyCount` and `applicationCount`.

Example:
```http
GET /managers?page=2&limit=25
```
