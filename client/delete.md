# Property Delete: Frontend Integration

This doc explains how to delete a property from the frontend.

## Endpoint

### Delete property
- Method: `DELETE`
- Path: `/properties/:id`
- Auth: `manager` role (Bearer token)

Behavior:
- Delete the property plus related records (applications, leases, payments).
- If the property's location is no longer used, it is removed.
- Returns `204 No Content` on success.

Examples (fetch):
```ts
await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Error handling

- `400` if `id` is not a valid number.
- `401` if no token is provided.
- `403` if the user role is not `manager`.
- `404` if the property does not exist.
- `500` for server errors.

## Suggested UI behavior

- Confirm before delete (modal or inline confirmation).
- On success, remove the item from the list and show a toast.
- If the request fails, keep the item and show the error message.
