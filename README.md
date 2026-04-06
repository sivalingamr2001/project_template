# File Access Portal

Small internal demo application built with the `dotnet-claude-kit` conventions.

## Scenario

This system handles offline file access requests in an online workflow:

1. User raises a request for a folder or file
2. Department HOD verifies and approves or rejects it with comments
3. IT team verifies and grants or rejects access
4. Rejected requests go back to the user for resubmission
5. Granted access is valid for 365 days, then needs renewal
6. IT can revoke access at any time

The implementation assumes around **1000 users**, so a single API and a single React frontend are enough for the first version.

## Solution Layout

- `src/FileAccessPortal.Api` — ASP.NET Core Minimal API
- `src/FileAccessPortal.Domain` — shared domain models and workflow rules
- `ui` — React frontend scaffold
- `camunda/file-access-approval.bpmn` — BPMN starter workflow for Camunda
- `CLAUDE.md` — project-specific instructions derived from this toolkit

## Backend Run

```bash
cd samples/file-access-portal
dotnet run --project src/FileAccessPortal.Api --urls http://localhost:5080
```

On first run the app creates a SQLite database automatically and seeds demo employees.

## API Documentation

When running in development mode, Swagger UI is available at:
- **Swagger UI**: `http://localhost:5080/swagger`
- **OpenAPI JSON**: `http://localhost:5080/swagger/v1/swagger.json`

The API will expose:

- `GET /api/system/health`
- `GET /api/system/seed-users`
- `GET /api/auth/demo-users`
- `POST /api/auth/login`
- `GET /api/dashboard/me`
- `GET /api/requests/me`
- `GET /api/notifications/me`
- `POST /api/requests`
- `POST /api/requests/{requestId}/items/{accessItemId}/hod-review`
- `POST /api/requests/{requestId}/items/{accessItemId}/it-review`
- `POST /api/requests/{requestId}/items/{accessItemId}/resubmit`
- `POST /api/requests/{requestId}/renew`
- `POST /api/requests/{requestId}/items/{accessItemId}/revoke`
- `GET /hubs/notifications`

## Frontend Run

The React app is scaffolded under `ui/`.

```bash
cd samples/file-access-portal/ui
npm install
npm run dev
```

Default frontend API base URL:

- `http://localhost:5080`

You can change it with:

```bash
VITE_API_BASE_URL=http://localhost:5080 npm run dev
```

## Seeded Demo Roles

- `Anitha` — User, Finance
- `Rahul` — HOD, Finance
- `Meena` — User, Human Resources
- `Karthik` — HOD, Human Resources
- `Sanjay` — IT Team, Operations

Default password for all seeded demo users:

- `Password@123`

## Camunda Integration

The API now includes a Camunda workflow client abstraction and defaults to **offline mode** unless you enable it in config.

Configuration section:

```json
"Camunda": {
  "Enabled": false,
  "BaseUrl": "http://localhost:8080/engine-rest",
  "ProcessDefinitionKey": "file-access-approval",
  "StartProcessPath": "process-definition/key/{processDefinitionKey}/start",
  "MessageCorrelationPath": "message"
}
```

When enabled, the API will:

- start a Camunda process when a request is created
- publish workflow messages on HOD approval/rejection
- publish workflow messages on IT approval/rejection
- publish workflow messages on resubmission, renewal, and revocation

## Security And Performance

The API now includes:

- global exception middleware returning Problem Details
- JWT bearer authentication with role claims
- security headers middleware
- correlation ID middleware
- output caching for system endpoints
- response compression
- rate limiting
- restricted CORS via configuration
- Kestrel server header disabled
- SignalR notifications pushed to authenticated employees
- SQLite persistence for development and MySQL configuration for production

## Database Provider

Current default:

- development: SQLite
- production target: MySQL via MySql.EntityFrameworkCore provider

Config lives in `src/FileAccessPortal.Api/appsettings*.json` under:

```json
"Database": {
  "Provider": "Sqlite",
  "SqliteConnectionString": "Data Source=file-access-portal.dev.db",
  "MySqlConnectionString": "server=localhost;port=3306;database=file_access_portal;user=root;password=change-me"
}
```

## Next Recommended Steps

- Replace in-memory storage with EF Core + Sqlite DB for dev purpose in production use MySql
- Add real authentication and role claims
- Move notifications to email, Teams, or SignalR
- Deploy the BPMN into Camunda and align message names with the production process
