# API Integration Quick Reference

## Installation & Setup

```bash
# API client is already generated from nswag.json
# If server APIs change, regenerate:
npm run generate:api

# Ensure server is running on http://localhost:5052
```

## Imports

```typescript
// API Services (direct axios calls)
import { authApi, employeeApi, accessRequestApi } from '@/core/api/services';

// React Query Hooks (recommended for components)
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/core/query/useEmployees';
import { useAccessRequests, useCreateAccessRequest } from '@/core/query/useAccessRequests';
```

## Common Patterns

### Fetch Data
```typescript
const { data, isLoading, error } = useEmployees();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error</div>;
// Use data...
```

### Create
```typescript
const mutation = useCreateEmployee();

// In handler:
mutation.mutate({ email: '...', ... });

// Watch status:
mutation.isPending, mutation.error, mutation.data
```

### Update
```typescript
const mutation = useUpdateEmployee();

mutation.mutate({ 
  id: 1, 
  request: { displayName: 'New Name' } 
});
```

### Delete
```typescript
const mutation = useDeleteEmployee();

mutation.mutate(employeeId);
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all
- `GET /api/employees/{id}` - Get one
- `POST /api/employees` - Create
- `PUT /api/employees/{id}` - Update
- `DELETE /api/employees/{id}` - Delete

### Access Requests
- `GET /api/accessrequests` - List user's requests
- `GET /api/accessrequests/{id}` - Get one
- `POST /api/accessrequests` - Create
- `PUT /api/accessrequests/{id}` - Update
- `PUT /api/accessrequests/{requestId}/items/{itemId}/approve` - Approve
- `PUT /api/accessrequests/{requestId}/items/{itemId}/reject` - Reject
- `DELETE /api/accessrequests/{id}` - Delete

## Mutation States

All mutations have:
- `isPending` - Request in progress
- `isSuccess` - Completed successfully
- `isError` - Failed
- `data` - Response data
- `error` - Error object
- `mutate()` - Trigger mutation
- `mutateAsync()` - Trigger and await

## Error Handling

```typescript
try {
  const result = await mutation.mutateAsync(data);
} catch (error) {
  // Error is of type AppError
  console.log(error.message, error.code, error.statusCode);
}
```

## Type Definitions

Common types:

```typescript
// Employee
interface Employee {
  userId: number;
  email: string;
  displayName: string;
  department: string;
  employeeId: string;
  role: string;
  isActive: boolean;
}

// Access Request
interface AccessRequest {
  accessReqId: number;
  ticketNumber: string;
  status: string;
  accessItems: AccessItem[];
}
```

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:5052/api  (development)
VITE_API_BASE_URL=https://api.prod.com/api   (production)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 errors | Check token in auth store, verify interceptor attached |
| nswag generation fails | Ensure server running on :5052, swagger enabled |
| CORS errors | Check server CORS configuration |
| Type errors | Regenerate: `npm run generate:api` |
| Stale data | Force refetch: `queryClient.invalidateQueries()` |

## File Locations

- **Services**: `src/core/api/services/`
- **Hooks**: `src/core/query/`
- **Interceptors**: `src/core/api/interceptors/`
- **Config**: `src/config/env.ts`
- **Guide**: `API_INTEGRATION_GUIDE.md`
- **Examples**: `src/core/api/EXAMPLES.md`
