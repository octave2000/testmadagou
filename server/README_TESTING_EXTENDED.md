# Testing Additional Features (Applications, Leases, Tenants, Managers)

This guide explains how to test the features for Applications, Leases, Tenants, and Managers, supplementing the Property testing guide.

## 1. Application Management

### List Application
Retrieve applications, optionally filtering by user type (`manager` or `tenant`).

#### List Applications for a Tenant:
```bash
curl "http://localhost:3001/applications?userId=<TENANT_COGNITO_ID>&userType=tenant" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### List Applications for a Manager:
```bash
curl "http://localhost:3001/applications?userId=<MANAGER_COGNITO_ID>&userType=manager" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Update Application Status (Approve/Deny)
Managers can update the status of an application. Approving an application will automatically create a Lease and assign the Tenant to the Property.

**Note:** Ensure the property is "For Rent" (has a `pricePerMonth`) before approving.

#### Approve Application:
```bash
curl -X PUT http://localhost:3001/applications/<APPLICATION_ID>/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d 
  {
    "status": "Approved"
  }
```

**Expected Result:**
- HTTP 200 OK
- JSON object of the application with `status: "Approved"`.
- A new `Lease` object is created and linked.
- The `Property` is updated to include the tenant.

#### Deny Application:
```bash
curl -X PUT http://localhost:3001/applications/<APPLICATION_ID>/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d 
  {
    "status": "Denied"
  }
```

## 2. Lease Management

### Get Leases
Retrieve all leases associated with the authenticated user (Manager or Tenant).

```bash
curl "http://localhost:3001/leases" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Lease Payments
Retrieve payment history for a specific lease.

```bash
curl "http://localhost:3001/leases/<LEASE_ID>/payments" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 3. Tenant Features

### Manage Favorites
Tenants can add or remove properties from their favorites list.

#### Add Favorite:
```bash
curl -X POST http://localhost:3001/tenants/<TENANT_COGNITO_ID>/favorites/<PROPERTY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Remove Favorite:
```bash
curl -X DELETE http://localhost:3001/tenants/<TENANT_COGNITO_ID>/favorites/<PROPERTY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Current Residences
Retrieve properties where the tenant currently resides (has an active lease/association).

```bash
curl "http://localhost:3001/tenants/<TENANT_COGNITO_ID>/current-residences" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get/Update Tenant Profile

#### Get Profile:
```bash
curl "http://localhost:3001/tenants/<TENANT_COGNITO_ID>" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Update Profile:
```bash
curl -X PUT http://localhost:3001/tenants/<TENANT_COGNITO_ID>" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d 
  {
    "name": "Jane Doe Updated",
    "phoneNumber": "555-9999"
  }
```

## 4. Manager Features

### Get/Update Manager Profile

#### Get Profile:
```bash
curl "http://localhost:3001/managers/<MANAGER_COGNITO_ID>" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Update Profile:
```bash
curl -X PUT http://localhost:3001/managers/<MANAGER_COGNITO_ID>" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d 
  {
    "name": "Manager John Updated",
    "email": "manager.john@example.com"
  }
```

### Get Manager's Properties
Retrieve a list of properties managed by a specific manager.

```bash
curl "http://localhost:3001/managers/<MANAGER_COGNITO_ID>/properties" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
